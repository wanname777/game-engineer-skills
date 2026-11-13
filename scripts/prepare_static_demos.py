#!/usr/bin/env python3
"""Copy selected canonical example assets into Vite's generated public directory."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'demos/reuse'
OUTPUT = ROOT / 'public/reuse'


def main():
    examples = {
        'moon-greenhouse': ('introduction.html', 'tokens.json', 'interface-spec.json'),
        'moon-garden': ('index.html', 'src', 'lunar-garden.mp4', 'lunar-garden-cover.png', 'brief.json', 'lunar-garden-metadata.json'),
    }
    for name, files in examples.items():
        for filename in files:
            source = SOURCE / name / filename
            if not source.exists() or source.is_symlink():
                raise SystemExit(f'Missing canonical demo asset: {source}')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, files in examples.items():
        destination = OUTPUT / name
        if destination.exists():
            shutil.rmtree(destination)
        destination.mkdir(exist_ok=True)
        for filename in files:
            source = SOURCE / name / filename
            target = destination / ('index.html' if filename == 'introduction.html' else filename)
            if source.is_dir():
                shutil.copytree(source, target, dirs_exist_ok=True)
            else:
                shutil.copy2(source, target)
    print('Prepared two static demos from canonical sources.')


if __name__ == '__main__':
    main()
