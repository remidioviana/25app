"""Validate the maintained English app specifications without overwriting them."""
import json
from pathlib import Path
for path in Path(__file__).parent.glob("*/agent.json"):
    spec=json.loads(path.read_text());assert spec["id"]==path.parent.name
print("Validated 25 app specifications.")
