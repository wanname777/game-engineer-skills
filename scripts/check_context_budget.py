#!/usr/bin/env python3
"""Prevent source files from exceeding the project's 20 KiB context heuristic."""
import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIMIT = 20 * 1024
SOURCE_EXTENSIONS = {'.ts', '.tsx', '.js', '.mjs', '.css', '.py', '.md'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--all', action='store_true', help='Check working-tree source files, including untracked files')
    args = parser.parse_args()
    command = ['git', 'ls-files', '-z', '--cached', '--others', '--exclude-standard'] if args.all else ['git', 'diff', '--cached', '--name-only', '-z', '--diff-filter=ACM']
    paths = subprocess.check_output(command, cwd=ROOT).decode().split('\0')
    violations = []
    for name in set(filter(None, paths)):
        path = Path(name)
        if path.suffix not in SOURCE_EXTENSIONS or name.startswith(('docs/research/', 'research/', 'demos/', '.trae/skills/', '.claude/skills/')):
            continue
        if args.all:
            source = ROOT / name
            if not source.is_file():
                continue
            size = source.stat().st_size
        else:
            size = len(subprocess.check_output(['git', 'show', ':'+name], cwd=ROOT))
        if size > LIMIT:
            violations.append(f'{name}: {size:,} bytes (limit {LIMIT:,}); split by responsibility')
    if violations:
        print('\n'.join(violations), file=sys.stderr)
        return 1
    print('Context budget passed (20 KiB is a byte heuristic, not an exact token count).')
    return 0


if __name__ == '__main__':
    sys.exit(main())
