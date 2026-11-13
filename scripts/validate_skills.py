#!/usr/bin/env python3
"""Validate project skill metadata and references without third-party modules."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / '.agents' / 'skills'
EXPECTED = {'design-game-interface', 'create-motion-showreel', 'discover-project',
            'choose-project-stack', 'deliver-project', 'recover-project-context'}


def main():
    errors = []
    present = {p.name for p in SKILLS.iterdir() if p.is_dir()}
    if present != EXPECTED:
        errors.append(f'Skill set mismatch: missing={EXPECTED-present}, extra={present-EXPECTED}')
    for folder in sorted(SKILLS.iterdir()):
        if not folder.is_dir():
            continue
        source = folder / 'SKILL.md'
        if not source.is_file():
            errors.append(f'{folder.name}: missing SKILL.md')
            continue
        text = source.read_text()
        match = re.match(r'\A---\s*\n(.*?)\n---(?:\n|$)', text, re.S)
        if not match:
            errors.append(f'{folder.name}: missing YAML frontmatter')
            continue
        metadata = {}
        for line in match.group(1).splitlines():
            if line and not line[0].isspace() and ':' in line:
                key, value = line.split(':', 1)
                metadata[key] = value.strip().strip('"\'')
        if set(metadata) != {'name', 'description'}:
            errors.append(f'{folder.name}: frontmatter must contain only name and description')
        if metadata.get('name') != folder.name or not re.fullmatch(r'[a-z0-9-]{1,64}', folder.name):
            errors.append(f'{folder.name}: invalid or inconsistent name')
        if not metadata.get('description') or len(metadata['description']) > 1024:
            errors.append(f'{folder.name}: description must be nonempty and concise')
        if len(text.splitlines()) > 500 or re.search(r'\bTODO\b|\[TODO', text):
            errors.append(f'{folder.name}: unfinished template or >500 lines')
        ui = folder / 'agents' / 'openai.yaml'
        if not ui.is_file() or f'${folder.name}' not in ui.read_text():
            errors.append(f'{folder.name}: missing UI metadata or skill in default_prompt')
        for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
            if target.startswith(('https:', 'http:', '#')):
                continue
            path = target.split('#')[0]
            if path and not (folder / path).exists():
                errors.append(f'{folder.name}: broken resource link {target}')
        print(f'checked {folder.name}')
    if errors:
        for error in errors:
            print(f'ERROR: {error}', file=sys.stderr)
        return 1
    print(f'{len(present)} skills valid: metadata, resources, names and prompts')
    return 0


if __name__ == '__main__':
    sys.exit(main())
