import json
import subprocess
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]


def parse_tags_as_browser(raw_tags: str) -> list[str]:
    script = (
        "const { parseTags } = require('./frontend/tag-utils.js');"
        f"console.log(JSON.stringify(parseTags({json.dumps(raw_tags)})));"
    )
    result = subprocess.run(
        ["node", "-e", script],
        cwd=ROOT_DIR,
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def test_tag_field_preserves_blank_entries_for_api_validation():
    assert parse_tags_as_browser("") == []
    assert parse_tags_as_browser("frontend, , client") == ["frontend", "", "client"]
    assert parse_tags_as_browser("   ") == [""]
