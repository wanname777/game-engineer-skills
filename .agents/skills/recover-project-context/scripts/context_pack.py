#!/usr/bin/env python3
"""Create a bounded, source-labelled handoff from current project files and Git."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess
import sys

SOURCES = (
    "AGENTS.md", "docs/project/brief.md", "docs/project/decisions.md",
    "docs/project/tasks.json", "docs/project/acceptance.md", "README.md",
)
MAX_SOURCE_BYTES = 12_000
DEFAULT_MAX_BYTES = 20_000
SECRET = re.compile(r"(?im)([\w.-]*(?:api[_-]?key|access[_-]?token|secret|password|credential)[\w.-]*\s*[:=]\s*)([^\s,;]+)")
EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?<!\d)(?:\+?86[ -]?)?1[3-9]\d{9}(?!\d)")
JWT = re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
SENSITIVE_PATH = re.compile(r"(?i)(?:^|[/_.-])(env|personal|private|credentials?|secrets?)(?:$|[/_.-])")


def redact(text: str) -> tuple[str, bool]:
    original = text
    text = SECRET.sub(r"\1[REDACTED]", text)
    text = EMAIL.sub("[REDACTED_EMAIL]", text)
    text = PHONE.sub("[REDACTED_PHONE]", text)
    text = JWT.sub("[REDACTED_TOKEN]", text)
    # Do not expose a credential embedded in an HTTP URL.
    text = re.sub(r"https?://[^\s/@:]+:[^\s/@]+@", "https://[REDACTED]@", text)
    return text, text != original


def git(root: Path, args: list[str]) -> tuple[str, bool]:
    try:
        result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True, timeout=5, check=False)
    except (OSError, subprocess.TimeoutExpired):
        return "不可读取（命令不可用或超时）", False
    if result.returncode:
        return "不可读取（非Git仓库、尚无提交或命令失败）", False
    return result.stdout.strip() or "（无输出）", True


def utf8_prefix(text: str, budget: int) -> str:
    return text.encode("utf-8")[:max(0, budget)].decode("utf-8", errors="ignore")


def build_pack(root: Path, max_bytes: int = DEFAULT_MAX_BYTES, sources: tuple[str, ...] = SOURCES) -> str:
    root = root.resolve()
    branch, _ = git(root, ["branch", "--show-current"])
    head, _ = git(root, ["rev-parse", "HEAD"])
    status, status_ok = git(root, ["status", "--porcelain=v1", "--untracked-files=normal"])
    omissions = [
        "仅收录约定或显式指定的项目文本来源；没有全量读取源代码或聊天历史。",
        "排除.env、personal/private、凭据、二进制、大文件、视频原件、录屏、node_modules和输出文件。",
        "不读取远程URL或密钥配置；个人联系方式和明显密钥模式仅作尽力脱敏，分享前仍需检查。",
        "未运行构建、测试、CI、部署或渲染；文档内结果属于有来源的历史陈述，需在新会话复核。",
    ]
    # Limit Git listings too: a large working tree must not displace the brief.
    if len(status.encode()) > 3000:
        status = utf8_prefix(status, 2800) + "\n[Git状态列表已截断]"
        omissions.append("Git状态列表超过3000 bytes，已截断；请运行git status读取完整状态。")
    status_lines = status.splitlines()
    safe_status = []
    for line in status_lines:
        if SENSITIVE_PATH.search(line[3:] if len(line) > 3 else line):
            safe_status.append("[敏感路径已省略]")
        else:
            safe_status.append(redact(line)[0])
    status = "\n".join(safe_status)
    header = (
        "# 项目上下文交接包\n\n"
        f"生成时间：{datetime.now(timezone.utc).isoformat()}\n"
        "生成器：recover-project-context/scripts/context_pack.py（当前文件与只读Git命令）\n"
        "规则：以当前拥有源为准；未知状态必须保留未知。20KB约5000token只是近似，中文不按此精确计数。\n\n"
        "## 当前Git事实\n"
        f"- 分支（git branch --show-current）：{redact(branch)[0]}\n"
        f"- HEAD（git rev-parse HEAD）：{redact(head)[0]}\n"
        f"- 工作区（git status --porcelain=v1）：{'读取成功' if status_ok else '无法确认'}\n"
        f"```text\n{status}\n```\n\n"
        "## 项目来源快照\n"
    )
    sections = []
    for relative in sources:
        path = root / relative
        label = f"### 来源：{relative}\n"
        if SENSITIVE_PATH.search(relative):
            omissions.append("显式来源中有敏感路径，已省略路径与内容。")
            continue
        if not path.exists():
            omissions.append(f"{relative}：不存在，未猜测内容。")
            continue
        try:
            resolved = path.resolve()
            if not resolved.is_relative_to(root) or path.is_symlink():
                omissions.append(f"{relative}：符号链接或仓库外路径，未读取。")
                continue
            if not path.is_file() or path.stat().st_size > MAX_SOURCE_BYTES:
                omissions.append(f"{relative}：不是普通文件或超过{MAX_SOURCE_BYTES} bytes，未读取。")
                continue
            data = path.read_bytes()
            if b"\x00" in data:
                omissions.append(f"{relative}：疑似二进制，未读取。")
                continue
            content = data.decode("utf-8")
        except (OSError, UnicodeError):
            omissions.append(f"{relative}：不可读取或不是UTF-8文本。")
            continue
        if relative.endswith(".json"):
            try:
                content = json.dumps(json.loads(content), ensure_ascii=False, indent=2) + "\n"
            except json.JSONDecodeError:
                label += "状态：JSON格式无效，以下仅作为原文，不能作为可靠任务状态。\n"
        content, did_redact = redact(content)
        if did_redact:
            omissions.append(f"{relative}：已遮盖检测到的联系方式或凭据模式。")
        label += "状态：读取当前工作区文件；内容陈述尚未独立复核。\n\n"
        sections.append((relative, label + content.rstrip() + "\n\n"))
    # Reserve enough room for mandatory omissions and a recovery task, even when sources grow.
    source_instructions = "、".join(f"`{redact(relative)[0]}`" for relative in sources if not SENSITIVE_PATH.search(relative))
    footer = (
        "## 遗漏与状态限制\n" + "\n".join(f"- {item}" for item in omissions) + "\n\n"
        "## 新会话任务\n"
        "读取当前README.md与AGENTS.md遵守仓库规则；本次项目来源为：" + source_instructions + "。\n"
        "以这些来源核对当前Git、项目目标、决策和任务；不要把其他子项目的默认文档混作拥有源。"
        "只加载一个最相关skill，指出仍有效的决策、阻塞与下一步；实施后记录真实验证结果。"
        "独立验收只接收skill路径、任务和原始输入，不沿用前一会话的预期答案。\n"
    )
    reserve = len(footer.encode()) + 900
    available = max_bytes - len(header.encode()) - reserve
    included = []
    truncated = []
    for relative, section in sections:
        if len(section.encode()) <= available:
            included.append(section)
            available -= len(section.encode())
        elif available > 300:
            note = "\n[来源内容因交接包预算截断；请读取原路径]\n\n"
            included.append(utf8_prefix(section, available - len(note.encode())) + note)
            available = 0
            truncated.append(relative)
        else:
            truncated.append(relative)
    if truncated:
        footer = footer.replace("## 遗漏与状态限制\n", "## 遗漏与状态限制\n- 包预算导致截断或未收录：" + "、".join(truncated) + "；请按来源路径读取完整文件。\n")
    result = header + "".join(included) + footer
    if len(result.encode()) > max_bytes:
        # Tiny requested budgets preserve source paths and status limitations over snapshots.
        if len(footer.encode()) > max_bytes - 500:
            footer = utf8_prefix(footer, max_bytes - 650) + "\n[遗漏列表因预算截断；请按原始来源清单重新读取。]\n"
        result = utf8_prefix(header, max_bytes - len(footer.encode()) - 90) + "\n[包预算不足，快照已省略]\n\n" + footer
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="Repository root (default: current directory)")
    destinations = parser.add_mutually_exclusive_group()
    destinations.add_argument("--output", type=Path, help="Write Markdown to a selected path")
    destinations.add_argument("--stdout", action="store_true", help="Write Markdown to stdout (default)")
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES, help="UTF-8 package budget, 4000–100000; default 20000")
    parser.add_argument("--source", action="append", help="Explicit relative .md/.json/.txt source; repeat to replace the default source list")
    args = parser.parse_args()
    if not args.root.is_dir():
        parser.error("--root must be an existing directory")
    if not 4000 <= args.max_bytes <= 100000:
        parser.error("--max-bytes must be between 4000 and 100000")
    sources = tuple(dict.fromkeys(args.source)) if args.source else SOURCES
    for source in sources:
        relative = Path(source)
        if relative.is_absolute() or ".." in relative.parts or relative.suffix.lower() not in {".md", ".json", ".txt"}:
            parser.error("--source must be a relative .md/.json/.txt path inside the repository")
        if SENSITIVE_PATH.search(source):
            parser.error("--source must not select an environment or private path")
    if args.output:
        target = args.output.resolve()
        if target in [(args.root.resolve() / path).resolve() for path in (*SOURCES, *sources)]:
            parser.error("--output must not overwrite a source document")
        if SENSITIVE_PATH.search(target.name):
            parser.error("--output must not target an environment or private file")
    pack = build_pack(args.root, args.max_bytes, sources)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(pack, encoding="utf-8")
        print(f"Wrote {len(pack.encode('utf-8'))} bytes to {args.output}", file=sys.stderr)
    else:
        sys.stdout.write(pack)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
