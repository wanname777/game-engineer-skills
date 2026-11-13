import {
  createIntroductionHtml,
  createTokenJson,
  parseGameplayDocument,
  themes,
} from "./model";
import type { DesignState, ObjectKind, SceneObject, ThemeId } from "./model";
import DesignIcon from "./DesignIcon";

export type InspectorTab = "object" | "theme" | "document";
interface InspectorProps {
  state: DesignState;
  selected: SceneObject;
  tab: InspectorTab;
  setTab: (tab: InspectorTab) => void;
  editState: (update: (previous: DesignState) => DesignState) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  setMessage: (message: string) => void;
  generatedDocument: string | null;
  setGeneratedDocument: (document: string | null) => void;
}

const kindNames: Record<ObjectKind, string> = {
  ship: "运输飞船",
  tower: "站点建筑",
  cargo: "补给货箱",
  beacon: "导航装置",
};

function download(content: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function InspectorPanel({
  state,
  selected,
  tab,
  setTab,
  editState,
  updateObject,
  setMessage,
  generatedDocument,
  setGeneratedDocument,
}: InspectorProps) {
  const palette = themes[state.theme];
  const preview =
    generatedDocument === null
      ? null
      : parseGameplayDocument(generatedDocument);
  return (
    <aside className="ds-inspector" aria-label="设计属性面板">
      <div className="ds-inspector-tabs" role="tablist" aria-label="设计面板">
        {(
          [
            { key: "object", name: "属性" },
            { key: "theme", name: "视觉" },
            { key: "document", name: "介绍页" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            id={`ds-tab-${item.key}`}
            role="tab"
            aria-selected={tab === item.key}
            aria-controls={`ds-panel-${item.key}`}
            tabIndex={tab === item.key ? 0 : -1}
            onClick={() => setTab(item.key)}
            onKeyDown={(event) => {
              const order: InspectorTab[] = ["object", "theme", "document"];
              const index = order.indexOf(tab);
              if (
                event.key === "ArrowRight" ||
                event.key === "ArrowLeft" ||
                event.key === "Home" ||
                event.key === "End"
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? "object"
                    : event.key === "End"
                      ? "document"
                      : order[
                          (index + (event.key === "ArrowRight" ? 1 : 2)) % 3
                        ];
                setTab(next);
                document.getElementById(`ds-tab-${next}`)?.focus();
              }
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      {tab === "object" && (
        <div
          className="ds-inspector-content"
          id="ds-panel-object"
          role="tabpanel"
          aria-labelledby="ds-tab-object"
        >
          <div className="ds-selected-summary">
            <div className="ds-selected-icon">
              <DesignIcon name={selected.kind} />
            </div>
            <span>
              <strong>{selected.name}</strong>
              <small>{kindNames[selected.kind]}</small>
            </span>
          </div>
          <label className="ds-field" htmlFor="ds-object-name">
            对象名称
            <input
              id="ds-object-name"
              value={selected.name}
              maxLength={80}
              onChange={(event) =>
                updateObject(selected.id, { name: event.target.value })
              }
            />
          </label>
          <div className="ds-property-section">
            <h3>
              空间与尺寸 <span>TRANSFORM</span>
            </h3>
            {(
              [
                { key: "x", label: "横向位置", min: 0, max: 100, step: 1 },
                { key: "y", label: "纵向位置", min: 0, max: 100, step: 1 },
                {
                  key: "scale",
                  label: "对象尺寸",
                  min: 0.5,
                  max: 1.5,
                  step: 0.05,
                },
              ] as const
            ).map((field) => (
              <label
                className="ds-range-field"
                key={field.key}
                htmlFor={`ds-object-${field.key}`}
              >
                <span>
                  {field.label}
                  <output>
                    {field.key === "scale"
                      ? `${Math.round(selected.scale * 100)}%`
                      : `${Math.round(selected[field.key])}%`}
                  </output>
                </span>
                <input
                  id={`ds-object-${field.key}`}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={selected[field.key]}
                  onChange={(event) =>
                    updateObject(selected.id, {
                      [field.key]: Number(event.target.value),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <label className="ds-visibility" htmlFor="ds-object-visible">
            <span>
              在场景中显示<small>隐藏后仍可从对象列表选中</small>
            </span>
            <input
              id="ds-object-visible"
              type="checkbox"
              checked={selected.visible}
              onChange={(event) =>
                updateObject(selected.id, { visible: event.target.checked })
              }
            />
          </label>
          <div className="ds-tip">
            <span aria-hidden="true">↗</span>
            <p>
              从一艘小飞船开始。调整它与港口的距离，让画面讲出「即将出发」的故事。
            </p>
          </div>
          <button className="ds-button ds-wide" onClick={() => setTab("theme")}>
            为星港换个气氛
            <DesignIcon name="arrow" />
          </button>
        </div>
      )}
      {tab === "theme" && (
        <div
          className="ds-inspector-content"
          id="ds-panel-theme"
          role="tabpanel"
          aria-labelledby="ds-tab-theme"
        >
          <span className="ds-kicker">ONE PALETTE, EVERYWHERE</span>
          <h3 className="ds-panel-heading">
            让整个世界，
            <br />
            说同一种语言。
          </h3>
          <p className="ds-panel-description">
            界面、场景与导出页面共享同一组颜色。
          </p>
          <div className="ds-theme-options">
            {(Object.entries(themes) as [ThemeId, typeof palette][]).map(
              ([id, theme]) => (
                <button
                  key={id}
                  className={`ds-theme-option ${state.theme === id ? "is-active" : ""}`}
                  aria-pressed={state.theme === id}
                  onClick={() => {
                    editState((previous) => ({ ...previous, theme: id }));
                    setMessage(
                      `已应用「${theme.label}」：场景、界面与导出变量同步更新。`,
                    );
                  }}
                >
                  <span
                    className="ds-theme-preview"
                    style={{ background: theme.paper }}
                  >
                    <i style={{ background: theme.accent }} />
                    <i style={{ background: theme.mint }} />
                    <i style={{ background: theme.ink }} />
                  </span>
                  <span>{theme.label}</span>
                  <span aria-hidden="true">
                    {state.theme === id ? "✓" : "○"}
                  </span>
                </button>
              ),
            )}
          </div>
          <div className="ds-property-section">
            <h3>
              共享颜色 <span>TOKENS</span>
            </h3>
            <div className="ds-swatches">
              {(["paper", "ink", "accent", "mint"] as const).map((key) => (
                <div key={key}>
                  <i style={{ background: palette[key] }} />
                  <span>
                    {key}
                    <small>{palette[key]}</small>
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="ds-button ds-button-accent ds-wide"
            onClick={() => {
              download(
                createTokenJson(state),
                "starport-design-tokens.json",
                "application/json",
              );
              setMessage(`已下载「${palette.label}」设计变量。`);
            }}
          >
            下载设计变量 ↓
          </button>
          <p className="ds-export-note">
            JSON 包含颜色、字号、间距与圆角，可用于你的游戏界面。
          </p>
        </div>
      )}
      {tab === "document" && (
        <div
          className="ds-inspector-content"
          id="ds-panel-document"
          role="tabpanel"
          aria-labelledby="ds-tab-document"
        >
          <span className="ds-kicker">FROM STORY TO PAGE</span>
          <h3 className="ds-panel-heading">先把游戏讲清楚。</h3>
          <p className="ds-panel-description">
            输入玩法原文，按标题与段落生成介绍页。保留内容，应用当前主题。
          </p>
          <div className="ds-field">
            <label htmlFor="ds-gameplay-document">玩法文档</label>
            <textarea
              id="ds-gameplay-document"
              value={state.document}
              maxLength={12000}
              rows={12}
              onChange={(event) => {
                editState((previous) => ({
                  ...previous,
                  document: event.target.value,
                }));
                setGeneratedDocument(null);
              }}
            />
          </div>
          <div className="ds-document-count">
            {state.document.length.toLocaleString()} / 12,000 字
          </div>
          <button
            className="ds-button ds-button-accent ds-wide"
            disabled={!state.document.trim()}
            onClick={() => {
              setGeneratedDocument(state.document);
              setMessage(
                "介绍页已生成。下方预览与 HTML 下载使用同一份玩法原文。",
              );
            }}
          >
            生成介绍页
            <DesignIcon name="arrow" />
          </button>
          {preview && (
            <>
              <div className="ds-intro-preview" aria-label="生成的介绍页预览">
                <span>PAGE PREVIEW</span>
                <h4>{preview.title}</h4>
                {preview.sections.map((section, index) => (
                  <section key={index}>
                    {section.heading && <h5>{section.heading}</h5>}
                    {section.lines
                      .filter((line) => line.trim())
                      .map((line, lineIndex) => (
                        <p key={lineIndex}>{line}</p>
                      ))}
                  </section>
                ))}
              </div>
              <button
                className="ds-button ds-wide"
                onClick={() => {
                  download(
                    createIntroductionHtml({
                      ...state,
                      document: generatedDocument!,
                    }),
                    "starport-introduction.html",
                    "text/html",
                  );
                  setMessage("已下载介绍页，可直接在浏览器打开。");
                }}
              >
                下载介绍页 HTML ↓
              </button>
            </>
          )}
          <p className="ds-export-note">
            介绍页只使用原文。界面的操作说明不会被混入游戏介绍。
          </p>
        </div>
      )}
    </aside>
  );
}
