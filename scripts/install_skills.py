#!/usr/bin/env python3
"""Link the canonical project skills into an agent's project-local discovery path."""
import argparse
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = {'trae': '.trae/skills', 'claude': '.claude/skills', 'codex': '.agents/skills'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target', choices=TARGETS, required=True)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    source = ROOT / '.agents/skills'
    destination = ROOT / TARGETS[args.target]
    if destination == source:
        print(f'Already canonical: {source}')
        return
    folders = sorted(p for p in source.iterdir() if p.is_dir() and (p/'SKILL.md').is_file())
    conflicts = []
    for folder in folders:
        link = destination / folder.name
        if (link.exists() or link.is_symlink()) and link.resolve() != folder.resolve():
            conflicts.append(str(link))
    if conflicts:
        parser.error('Existing paths differ; no changes made: '+', '.join(conflicts))
    if not args.dry_run:
        destination.mkdir(parents=True, exist_ok=True)
    for folder in folders:
        link = destination / folder.name
        relative = os.path.relpath(folder, destination)
        print(f'{"would link" if args.dry_run else "linked"}: {link.relative_to(ROOT)} -> {relative}')
        if not args.dry_run and not link.exists() and not link.is_symlink():
            link.symlink_to(relative, target_is_directory=True)


if __name__ == '__main__':
    main()
