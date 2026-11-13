#!/usr/bin/env python3
"""Run the reusable skill's canonical context-pack generator."""
from pathlib import Path
import runpy

if __name__ == "__main__":
    script = Path(__file__).resolve().parents[1] / ".agents/skills/recover-project-context/scripts/context_pack.py"
    runpy.run_path(str(script), run_name="__main__")
