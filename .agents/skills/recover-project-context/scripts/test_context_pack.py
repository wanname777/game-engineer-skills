#!/usr/bin/env python3
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("context_pack", Path(__file__).with_name("context_pack.py"))
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ContextPackTests(unittest.TestCase):
    def test_source_labels_redaction_and_missing_git(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs/project").mkdir(parents=True)
            (root / "docs/project/brief.md").write_text("# Goal\napi_key=demo-private-value\nowner@example.com\n13800138000\n", encoding="utf-8")
            (root / ".env").write_text("OTHER_SECRET=do-not-include", encoding="utf-8")
            result = module.build_pack(root)
            self.assertIn("来源：docs/project/brief.md", result)
            self.assertIn("无法确认", result)
            self.assertNotIn("demo-private-value", result)
            self.assertNotIn("owner@example.com", result)
            self.assertNotIn("13800138000", result)
            self.assertNotIn("do-not-include", result)
            self.assertIn("不存在", result)

    def test_budget_and_oversized_source(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs/project").mkdir(parents=True)
            (root / "README.md").write_text("测试" * 1800, encoding="utf-8")
            (root / "docs/project/brief.md").write_text("很大" * 8000, encoding="utf-8")
            result = module.build_pack(root, 4000)
            self.assertLessEqual(len(result.encode()), 4000)
            self.assertIn("12000 bytes", result)
            self.assertIn("包预算", result)
            self.assertIn("未运行", result)

    def test_symlink_and_invalid_tasks_do_not_claim_success(self):
        with tempfile.TemporaryDirectory() as directory, tempfile.TemporaryDirectory() as outside:
            root = Path(directory)
            (root / "docs/project").mkdir(parents=True)
            external = Path(outside) / "private.md"
            external.write_text("DO NOT READ OUTSIDE", encoding="utf-8")
            (root / "README.md").symlink_to(external)
            (root / "docs/project/tasks.json").write_text("{invalid", encoding="utf-8")
            result = module.build_pack(root)
            self.assertNotIn("DO NOT READ OUTSIDE", result)
            self.assertIn("符号链接", result)
            self.assertIn("JSON格式无效", result)
            self.assertNotIn("测试已通过", result)

    def test_explicit_project_sources_keep_their_own_context(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "demos").mkdir()
            (root / "demos/brief.md").write_text("# Example game\n状态：尚未试玩", encoding="utf-8")
            (root / "README.md").write_text("Different workbench", encoding="utf-8")
            result = module.build_pack(root, sources=("demos/brief.md",))
            self.assertIn("来源：demos/brief.md", result)
            self.assertIn("尚未试玩", result)
            self.assertNotIn("Different workbench", result)
            self.assertIn("本次项目来源为：`demos/brief.md`", result)
            self.assertNotIn("读取README.md、AGENTS.md与docs/project/brief.md", result)


if __name__ == "__main__":
    unittest.main()
