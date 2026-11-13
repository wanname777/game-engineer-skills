#!/usr/bin/env python3
"""Render plain gameplay text with validated design colors; no dependencies."""
import argparse
import html
import json
from pathlib import Path
import re
import sys


def render(document: str, tokens: dict) -> str:
    if not document.strip():
        raise ValueError("玩法文档为空")
    if len(document) > 12000:
        raise ValueError("玩法文档超过 12000 字")
    colors = tokens.get("colors")
    required = ("paper", "ink", "accent", "muted", "line")
    if not isinstance(colors, dict) or any(not isinstance(colors.get(key), str) or not re.fullmatch(r"#[0-9a-fA-F]{6}", colors[key]) for key in required):
        raise ValueError("colors 必须提供有效的六位十六进制 paper、ink、accent、muted、line")
    lines = document.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    first_title = next((index for index, line in enumerate(lines) if re.match(r"^#\s+", line)), None)
    title = re.sub(r"^#\s+", "", lines[first_title]).strip() if first_title is not None else "玩法介绍"
    sections = [{"heading": "", "lines": []}]
    for index, line in enumerate(lines):
        if index == first_title:
            continue
        if re.match(r"^#{1,6}\s+", line):
            sections.append({"heading": re.sub(r"^#{1,6}\s+", "", line).strip(), "lines": []})
        else:
            sections[-1]["lines"].append(line)
    content = []
    for section in sections:
        paragraphs = [line for line in section["lines"] if line.strip()]
        if not section["heading"] and not paragraphs:
            continue
        content.append("<section>" + ("<h2>" + html.escape(section["heading"]) + "</h2>" if section["heading"] else "") + "\n".join("<p>" + html.escape(line) + "</p>" for line in paragraphs) + "</section>")
    escaped_title = html.escape(title)
    css = f"*{{box-sizing:border-box}}body{{margin:0;background:{colors['paper']};color:{colors['ink']};font:18px/1.8 system-ui,sans-serif}}main{{max-width:880px;margin:auto;padding:8vw 6vw}}h1{{font-size:clamp(32px,6vw,64px);line-height:1.15;letter-spacing:-.04em}}h2{{font-size:24px;color:{colors['accent']}}}section{{padding:28px 0;border-top:1px solid {colors['line']}}}p{{white-space:pre-wrap;overflow-wrap:anywhere}}footer{{font-size:13px;color:{colors['muted']};margin-top:40px}}"
    return f'<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escaped_title}</title><style>{css}</style></head><body><main><h1>{escaped_title}</h1>' + "\n".join(content) + "<footer>由游造根据提供的玩法文档排版 · 内容保留原文</footer></main></body></html>\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--tokens", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    try:
        document = args.input.read_text(encoding="utf-8")
        tokens = json.loads(args.tokens.read_text(encoding="utf-8"))
        if not isinstance(tokens, dict):
            raise ValueError("设计变量须为 JSON 对象")
        output = render(document, tokens)
        if args.output.resolve() in (args.input.resolve(), args.tokens.resolve()):
            raise ValueError("输出路径不能覆盖原始文档或设计变量")
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(output, encoding="utf-8")
    except (OSError, UnicodeError, ValueError) as error:
        print(f"导出失败：{error}", file=sys.stderr)
        return 1
    print(f"已生成：{args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
