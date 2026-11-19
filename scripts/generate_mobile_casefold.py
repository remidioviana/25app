"""Generate the mobile text-folding table from the backend Python Unicode contract."""
import json
from pathlib import Path
import unicodedata


def build_table():
    return {
        'unicode_version': unicodedata.unidata_version,
        'source': 'Python str.casefold; unmapped code points remain unchanged',
        'mappings': {str(i): chr(i).casefold() for i in range(0x110000) if chr(i).casefold() != chr(i)},
    }


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[1] / 'mobile/src/experience/casefold.json'
    target.write_text(json.dumps(build_table(), ensure_ascii=True, indent=2) + '\n')
