import { describe, expect, it } from "vitest";
import {
  appendVersion,
  createInitialState,
  createIntroductionHtml,
  createTokenJson,
  isDesignState,
  makeVersion,
  parseGameplayDocument,
  readVersions,
} from "./model";

describe("design snapshots", () => {
  it("keeps a saved snapshot independent of later scene edits and limits history", () => {
    const state = createInitialState();
    const saved = makeVersion(
      state,
      "第一版",
      "version-1",
      "2026-11-13T00:00:00.000Z",
    );
    state.objects.harbor[0].x = 99;
    expect(saved.state.objects.harbor[0].x).toBe(40);
    const history = Array.from({ length: 12 }, (_, index) => ({
      ...saved,
      id: String(index),
    }));
    const next = appendVersion(history, saved);
    expect(next).toHaveLength(12);
    expect(next[0].id).toBe("1");
    expect(readVersions(JSON.stringify(next))).toEqual(next);
  });
  it("rejects corrupted, incompatible and unsafe scene states", () => {
    expect(readVersions(null)).toEqual([]);
    expect(() => readVersions("{bad")).toThrow();
    expect(() => readVersions('{"schema":0}')).toThrow();
    const state = createInitialState();
    state.objects.harbor[0].x = Infinity;
    expect(isDesignState(state)).toBe(false);
    state.objects.harbor[0].x = 40;
    state.objects.harbor.push({ ...state.objects.harbor[0] });
    expect(isDesignState(state)).toBe(false);
    expect(isDesignState({ ...createInitialState(), theme: "unknown" })).toBe(
      false,
    );
  });
});

describe("faithful introduction export", () => {
  it("preserves source paragraphs and displays untrusted markup as text", () => {
    const state = createInitialState();
    state.document =
      '# 游戏 <test>\n\n原文 & 细节\n\n## 控制\n<script>alert("x")</script>\n- **未知 Markdown** 保留';
    const parsed = parseGameplayDocument(state.document);
    expect(parsed.title).toBe("游戏 <test>");
    expect(parsed.sections[1].lines).toEqual([
      '<script>alert("x")</script>',
      "- **未知 Markdown** 保留",
    ]);
    const html = createIntroductionHtml(state);
    expect(html).toContain("原文 &amp; 细节");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("- **未知 Markdown** 保留");
    expect(html).not.toContain("立即购买");
  });
  it("uses the selected theme for both exported HTML and tokens", () => {
    const state = { ...createInitialState(), theme: "night" as const };
    const tokens = JSON.parse(createTokenJson(state));
    expect(tokens.colors.paper).toBe("#1d292c");
    expect(createIntroductionHtml(state)).toContain("--paper:#1d292c");
  });
});
