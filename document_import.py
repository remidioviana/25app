"""Bounded text extraction. PDF/office parsers never run in the HTTP worker process."""
import base64
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
from threading import BoundedSemaphore
import zipfile
import xml.etree.ElementTree as ET

MAX_BYTES=2_000_000
MAX_TEXT=200_000
PARSER_SLOTS=BoundedSemaphore(2)

def parse(raw,suffix):
    if not raw or len(raw)>MAX_BYTES:raise ValueError('File is empty or exceeds 2 MB')
    warnings=[]
    if suffix in ('.txt','.md','.csv'):
        try:text=raw.decode('utf-8-sig')
        except UnicodeDecodeError:raise ValueError('Text must use UTF-8 encoding') from None
        if '\x00' in text:raise ValueError('Binary content is not allowed as text')
        if suffix=='.csv':
            try:rows=list(csv.reader(io.StringIO(text),strict=True))
            except csv.Error:raise ValueError('Invalid CSV: check quoting and field size') from None
            if len(rows)>5000:raise ValueError('CSV exceeds 5,000 rows')
            text='\n'.join(' | '.join(row) for row in rows)
    elif suffix=='.pdf':
        if not raw.startswith(b'%PDF-'):raise ValueError('Invalid PDF signature')
        try:from pypdf import PdfReader
        except ImportError:raise ValueError('Install requirements-documents.txt to import PDFs') from None
        reader=PdfReader(io.BytesIO(raw),strict=True)
        if reader.is_encrypted:raise ValueError('Protected PDF: supply an authorized unencrypted copy')
        if len(reader.pages)>100:raise ValueError('PDF exceeds 100 pages')
        parts=[];total=0
        for i,page in enumerate(reader.pages,1):
            content=page.extract_text() or ''
            if not content.strip():warnings.append(f'Page {i}: no extractable text; OCR is not implemented')
            chunk=f'[Page {i}]\n{content}';total+=len(chunk)
            if total>MAX_TEXT:raise ValueError('Extracted text exceeds 200,000 characters')
            parts.append(chunk)
        if len(warnings)==len(reader.pages):raise ValueError('PDF has no extractable text; supply a transcript or OCR text')
        text='\n\n'.join(parts)
    elif suffix=='.docx':
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            members=archive.infolist()
            if len(members)>1000 or sum(x.file_size for x in members)>20_000_000:raise ValueError('DOCX exceeds the uncompressed size limit')
            if 'word/document.xml' not in archive.namelist():raise ValueError('Invalid DOCX document')
            xml=archive.read('word/document.xml')
            if b'<!DOCTYPE' in xml or b'<!ENTITY' in xml:raise ValueError('XML entities are not allowed')
            root=ET.fromstring(xml);ns='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            def paragraph_text(paragraph):
                return ''.join((node.text or '') if node.tag==ns+'t' else
                    '\t' if node.tag==ns+'tab' else '\n' if node.tag in (ns+'br',ns+'cr') else ''
                    for node in paragraph.iter())
            text='\n'.join(paragraph_text(p) for p in root.iter(ns+'p'))
        warnings.append('Body text extracted; notes, headers, images and formatting are not preserved')
    else:raise ValueError('Supported formats: TXT, MD, CSV, PDF or DOCX')
    if not text.strip():raise ValueError('No text extracted')
    if len(text)>MAX_TEXT:raise ValueError('Extracted text exceeds 200,000 characters')
    return {'text':text,'warnings':warnings,'format':suffix,'characters':len(text)}

def extract(filename,encoded):
    if not PARSER_SLOTS.acquire(blocking=False):raise ValueError('Extraction busy; retry after current jobs finish')
    try:return _extract(filename,encoded)
    finally:PARSER_SLOTS.release()

def _extract(filename,encoded):
    if not isinstance(filename,str) or len(filename)>200 or not isinstance(encoded,str) or len(encoded)>2_700_000:raise ValueError('Invalid upload')
    try:raw=base64.b64decode(encoded,validate=True)
    except Exception:raise ValueError('Invalid base64 content') from None
    if not raw or len(raw)>MAX_BYTES:raise ValueError('File is empty or exceeds 2 MB')
    suffix=Path(filename).suffix.lower()
    try:
        safe_env={k:v for k,v in os.environ.items() if k in ('PATH','SYSTEMROOT','WINDIR','PYTHONPATH','PYTHONHOME','LANG','LC_ALL','TMP','TEMP')}
        process=subprocess.run([sys.executable,str(Path(__file__).resolve()),'--worker',suffix],input=raw,capture_output=True,timeout=15,env=safe_env)
    except subprocess.TimeoutExpired:raise ValueError('Extraction exceeded 15 seconds') from None
    if len(process.stdout)>1_500_000:raise ValueError('Extracted output exceeds limit')
    try:result=json.loads(process.stdout)
    except (ValueError,UnicodeDecodeError):raise ValueError('Isolated extraction failed: invalid format or resource limit') from None
    if process.returncode or 'error' in result:raise ValueError(result.get('error','Extraction failed'))
    result['provenance']={'raw_sha256':hashlib.sha256(raw).hexdigest(),
        'extracted_text_sha256':hashlib.sha256(result['text'].encode('utf-8')).hexdigest(),
        'raw_bytes':len(raw),'authenticity_verified':False,
        'scope':'Import preview only; original file is not retained by this extraction endpoint.'}
    return result

if __name__=='__main__' and len(sys.argv)==3 and sys.argv[1]=='--worker':
    try:
        try:
            import resource
            resource.setrlimit(resource.RLIMIT_CPU,(10,10))
            resource.setrlimit(resource.RLIMIT_AS,(512*1024*1024,512*1024*1024))
        except ImportError:pass
        value=parse(sys.stdin.buffer.read(MAX_BYTES+1),sys.argv[2]);print(json.dumps(value,ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'error':str(e) if isinstance(e,ValueError) else 'File could not be parsed: '+type(e).__name__}));sys.exit(1)
