import gameplayDocument from "../../../demos/design/gameplay.md?raw";

export type ThemeId = "paper" | "night" | "tide";
export type SceneId = "harbor" | "garden";
export type ObjectKind = "ship" | "tower" | "cargo" | "beacon";
export interface SceneObject {
  id: string;
  name: string;
  kind: ObjectKind;
  x: number;
  y: number;
  scale: number;
  visible: boolean;
}
export interface DesignState {
  theme: ThemeId;
  scene: SceneId;
  objects: Record<SceneId, SceneObject[]>;
  document: string;
}
export interface SavedVersion {
  id: string;
  name: string;
  createdAt: string;
  state: DesignState;
}
export const STORAGE_KEY = "youzao.design.versions.v1";
export const themes = {
  paper: {
    label: "奶油星港",
    paper: "#f5f1e7",
    surface: "#fffdf7",
    ink: "#252d2b",
    muted: "#646a61",
    line: "#d8d9cd",
    accent: "#b94324",
    accentInk: "#ffffff",
    mint: "#b3d4ba",
    sky: "#e8eee0",
    shadow: "#869285",
  },
  night: {
    label: "午夜航线",
    paper: "#1d292c",
    surface: "#263639",
    ink: "#f4f0e7",
    muted: "#b5c5c4",
    line: "#526565",
    accent: "#f7b36a",
    accentInk: "#273232",
    mint: "#91beb2",
    sky: "#344f53",
    shadow: "#10282e",
  },
  tide: {
    label: "潮汐蓝图",
    paper: "#ecf3f3",
    surface: "#f8fcfc",
    ink: "#163940",
    muted: "#506d70",
    line: "#bfd5d5",
    accent: "#17637a",
    accentInk: "#ffffff",
    mint: "#b2ddd6",
    sky: "#d8e9ed",
    shadow: "#729fa9",
  },
} as const;
export const originalDocument = gameplayDocument.trimEnd();

export function createInitialState(): DesignState {
  return {
    theme: "paper",
    scene: "harbor",
    document: originalDocument,
    objects: {
      harbor: [
        {
          id: "post",
          name: "邮政塔",
          kind: "tower",
          x: 40,
          y: 32,
          scale: 1,
          visible: true,
        },
        {
          id: "courier",
          name: "快递飞船",
          kind: "ship",
          x: 60,
          y: 66,
          scale: 1,
          visible: true,
        },
        {
          id: "cargo",
          name: "待运货箱",
          kind: "cargo",
          x: 23,
          y: 62,
          scale: 1,
          visible: true,
        },
        {
          id: "signal",
          name: "进港航标",
          kind: "beacon",
          x: 78,
          y: 42,
          scale: 1,
          visible: true,
        },
      ],
      garden: [
        {
          id: "greenhouse",
          name: "温室塔",
          kind: "tower",
          x: 46,
          y: 35,
          scale: 1.15,
          visible: true,
        },
        {
          id: "delivery",
          name: "补给货箱",
          kind: "cargo",
          x: 31,
          y: 62,
          scale: 0.8,
          visible: true,
        },
        {
          id: "garden-ship",
          name: "快递飞船",
          kind: "ship",
          x: 67,
          y: 62,
          scale: 0.85,
          visible: true,
        },
      ],
    },
  };
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isObject(value: unknown): value is SceneObject {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    value.id.length <= 80 &&
    typeof value.name === "string" &&
    value.name.length <= 80 &&
    ["ship", "tower", "cargo", "beacon"].includes(String(value.kind)) &&
    typeof value.x === "number" &&
    Number.isFinite(value.x) &&
    value.x >= 0 &&
    value.x <= 100 &&
    typeof value.y === "number" &&
    Number.isFinite(value.y) &&
    value.y >= 0 &&
    value.y <= 100 &&
    typeof value.scale === "number" &&
    Number.isFinite(value.scale) &&
    value.scale >= 0.5 &&
    value.scale <= 1.5 &&
    typeof value.visible === "boolean"
  );
}
export function isDesignState(value: unknown): value is DesignState {
  if (
    !isRecord(value) ||
    !["paper", "night", "tide"].includes(String(value.theme)) ||
    !["harbor", "garden"].includes(String(value.scene)) ||
    typeof value.document !== "string" ||
    value.document.length > 12000 ||
    !isRecord(value.objects)
  )
    return false;
  return ["harbor", "garden"].every((scene) => {
    const objects = value.objects as Record<string, unknown>;
    const list = objects[scene];
    return (
      Array.isArray(list) &&
      list.length > 0 &&
      list.length <= 30 &&
      list.every(isObject) &&
      new Set(list.map((item) => item.id)).size === list.length
    );
  });
}
export function readVersions(raw: string | null): SavedVersion[] {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (
    !Array.isArray(parsed) ||
    parsed.length > 12 ||
    !parsed.every(
      (version) =>
        isRecord(version) &&
        typeof version.id === "string" &&
        version.id.length > 0 &&
        version.id.length <= 120 &&
        typeof version.name === "string" &&
        version.name.length <= 80 &&
        typeof version.createdAt === "string" &&
        Number.isFinite(Date.parse(version.createdAt)) &&
        isDesignState(version.state),
    ) ||
    new Set(parsed.map((version) => version.id)).size !== parsed.length
  )
    throw new Error("版本数据格式不兼容");
  return parsed as SavedVersion[];
}
export function makeVersion(
  state: DesignState,
  name: string,
  id: string,
  now: string,
): SavedVersion {
  return {
    id,
    name: name.trim().slice(0, 80) || "未命名版本",
    createdAt: now,
    state: structuredClone(state),
  };
}
export function appendVersion(versions: SavedVersion[], version: SavedVersion) {
  return [...versions, version].slice(-12);
}

export interface DocumentSection {
  heading: string;
  lines: string[];
}
export function parseGameplayDocument(document: string) {
  const lines = document.replace(/\r\n?/g, "\n").split("\n");
  const firstTitle = lines.findIndex((line) => /^#\s+/.test(line));
  const title =
    firstTitle === -1
      ? "玩法介绍"
      : lines[firstTitle].replace(/^#\s+/, "").trim();
  const sections: DocumentSection[] = [{ heading: "", lines: [] }];
  lines.forEach((line, index) => {
    if (index === firstTitle) return;
    if (/^#{1,6}\s+/.test(line))
      sections.push({
        heading: line.replace(/^#{1,6}\s+/, "").trim(),
        lines: [],
      });
    else sections[sections.length - 1].lines.push(line);
  });
  return {
    title,
    sections: sections.filter(
      (section) => section.heading || section.lines.some((line) => line.trim()),
    ),
  };
}
export function escapeHtml(text: string) {
  return text.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
export function createIntroductionHtml(state: DesignState) {
  const theme = themes[state.theme];
  const { title, sections } = parseGameplayDocument(state.document);
  const content = sections
    .map(
      (section) =>
        `<section>${section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : ""}${section.lines
          .filter((line) => line.trim())
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("\n")}</section>`,
    )
    .join("\n");
  return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>:root{color-scheme:${state.theme === "night" ? "dark" : "light"};--paper:${theme.paper};--ink:${theme.ink};--accent:${theme.accent}}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:18px/1.8 system-ui,sans-serif}main{max-width:880px;margin:auto;padding:8vw 6vw}h1{font-size:clamp(32px,6vw,64px);line-height:1.15;letter-spacing:-.04em;max-width:800px}h2{font-size:24px;color:var(--accent);margin:0 0 16px}section{padding:28px 0;border-top:1px solid ${theme.line}}p{white-space:pre-wrap;margin:12px 0;overflow-wrap:anywhere}footer{margin-top:40px;font-size:13px;color:${theme.muted}}</style></head><body><main><h1>${escapeHtml(title)}</h1>${content}<footer>由游造根据提供的玩法文档排版 · 内容保留原文</footer></main></body></html>`;
}
export function createTokenJson(state: DesignState) {
  const theme = themes[state.theme];
  return JSON.stringify(
    {
      schema: "youzao.design-tokens.v1",
      name: theme.label,
      colors: {
        paper: theme.paper,
        surface: theme.surface,
        ink: theme.ink,
        muted: theme.muted,
        line: theme.line,
        accent: theme.accent,
        accentInk: theme.accentInk,
        mint: theme.mint,
        sky: theme.sky,
        shadow: theme.shadow,
      },
      typography: { family: "system-ui, sans-serif", body: 14, title: 32 },
      spacing: [4, 8, 12, 16, 24, 32, 48],
      radius: { panel: 16, control: 8 },
    },
    null,
    2,
  );
}
