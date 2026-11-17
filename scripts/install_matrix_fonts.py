import pathlib,urllib.request,re,json,hashlib,concurrent.futures
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from io import BytesIO
ROOT=pathlib.Path(__file__).resolve().parents[1]
PAIRS=[('himayah','IBM Plex Sans','IBM Plex Sans Arabic'),('iqamah','Cormorant Garamond','Noto Naskh Arabic'),('istithmar','Space Grotesk','Alexandria'),('munagasah','Archivo Narrow','Tajawal'),('sahil','Plus Jakarta Sans','Cairo'),('tawteen','Manrope','Readex Pro'),('adl','Libre Baskerville','Amiri'),('tawassul','Sora','Vazirmatn'),('adab','Fraunces','Aref Ruqaa'),('khidmah','Nunito Sans','Almarai'),('jomrok','Barlow Condensed','Changa'),('khibrat','DM Sans','Harmattan'),('majlis','Urbanist','Kufam'),('rafiq','Quicksand','Noto Kufi Arabic'),('sawm','Newsreader','Scheherazade New'),('mizan','Public Sans','Mada'),('thawg','Bricolage Grotesque','Baloo Bhaijaan 2'),('manzil','Outfit','El Messiri'),('gurbah','Epilogue','Reem Kufi'),('amanah-eco','Raleway','Lemonada'),('nafas','Comfortaa','Markazi Text'),('tadweer','Work Sans','Jomhuria'),('turath','Literata','Lateef'),('himam','Atkinson Hyperlegible','Noto Sans Arabic'),('hisad','Syne','Katibeh')]
def read(url):
 req=urllib.request.Request(url,headers={'User-Agent':'25app-font-license-audit/1.0'})
 return urllib.request.urlopen(req,timeout=45).read()
def fetch(task):
 id,family,script=task;directory=re.sub('[^a-z0-9]','',family.lower());base='https://raw.githubusercontent.com/google/fonts/main/ofl/'+directory+'/'
 meta=read(base+'METADATA.pb').decode();names=re.findall(r'filename: "([^"]+)"',meta);normal=[n for n in names if 'italic' not in n.lower()];preferred='-SemiBold.ttf'if script=='latin'else'-Regular.ttf';filename=next((n for n in normal if n.endswith(preferred)),next((n for n in normal if '['in n),next((n for n in normal if n.endswith('-Regular.ttf')),normal[0])));font=read(base+urllib.parse.quote(filename));license=read(base+'OFL.txt');assert b'SIL OPEN FONT LICENSE' in license.upper();return id,family,script,base+urllib.parse.quote(filename),font,license
jobs=[(id,f,'latin')for id,f,a in PAIRS]+[(id,a,'arabic')for id,f,a in PAIRS]
results=[];errors=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6)as pool:
 for result in pool.map(fetch,jobs):results.append(result);print('Fetched',result[0],result[2],flush=True)
records=[];arabic=[]
for id,family,script,url,data,license in results:
 suffix=''if script=='latin'else'-arabic';path=ROOT/'mobile/assets/typefaces'/f'{id}{suffix}.ttf';font=TTFont(BytesIO(data));axes={}
 if 'fvar'in font:
  for a in font['fvar'].axes:
   value=600 if a.axisTag=='wght'and script=='latin'else 400 if a.axisTag=='wght'else 36 if a.axisTag=='opsz'else a.defaultValue
   axes[a.axisTag]=max(a.minValue,min(a.maxValue,value))
  font=instantiateVariableFont(font,axes,inplace=False)
 name=('ExperienceDisplay_'if script=='latin'else'ExperienceArabic_')+id.replace('-','_')
 for n in font['name'].names:
  if n.nameID in (1,4,6,16):
   try:n.string=name.encode(n.getEncoding())
   except (UnicodeEncodeError,LookupError):pass
 font.save(path);licensepath=path.with_name(path.stem+'-OFL.txt');licensepath.write_text('\n'.join(x.rstrip()for x in license.decode().splitlines())+'\n')
 record={'app':id,'file':str(path.relative_to(ROOT)),'source_family':family,'source_url':url,'source_sha256':hashlib.sha256(data).hexdigest(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'license_file':str(licensepath.relative_to(ROOT)),'bytes':path.stat().st_size,'instance_axes':axes}
 if script=='arabic':
  sample='العربيةالمالالمنزلحمايةأإآؤئءةى٠١٢٣٤٥٦٧٨٩';missing=sorted({c for c in sample if ord(c)not in font.getBestCmap()});record['arabic_sample_missing_characters']=missing;record['arabic_layout_tables']={x:x in font for x in ['GSUB','GPOS']};record['device_readability_verified']=False;arabic.append(record)
 else:records.append(record)
(ROOT/'project/evidence/typeface-inventory.json').write_text(json.dumps({'scope':'25 matrix-selected licensed Latin headline families; static renamed derivatives retain OFL notices','typefaces':records},indent=2)+'\n')
(ROOT/'project/evidence/arabic-typeface-inventory.json').write_text(json.dumps({'scope':'Bundled Arabic companions: coverage/layout checks are not device accessibility acceptance','typefaces':arabic},indent=2)+'\n')
lines=['// Static per-product Arabic assets; licenses are retained beside each font.','export const arabicTypefaces = {']+[json.dumps(id)+':require("../../assets/typefaces/'+id+'-arabic.ttf"),'for id,f,a in PAIRS]+['};']
(ROOT/'mobile/src/experience/arabicTypefaces.ts').write_text('\n'.join(lines)+'\n')
p=ROOT/'mobile/src/experience/identities.json';identities=json.loads(p.read_text())
for id,f,a in PAIRS:identities[id]['font_family']=f;identities[id]['arabic_font_family']=a
p.write_text(json.dumps(identities,indent=2)+'\n');print('Installed',len(records),'Latin and',len(arabic),'Arabic fonts. Coverage exceptions:',[(x['app'],x['arabic_sample_missing_characters'])for x in arabic if x['arabic_sample_missing_characters']])
