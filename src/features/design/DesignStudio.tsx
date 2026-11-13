import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import {
  appendVersion,
  clamp,
  createInitialState,
  makeVersion,
  readVersions,
  STORAGE_KEY,
  themes,
} from "./model";
import type { DesignState, SceneId, SceneObject } from "./model";
import SceneCanvas from "./SceneCanvas";
import DesignIcon from "./DesignIcon";
import InspectorPanel from "./InspectorPanel";
import type { InspectorTab } from "./InspectorPanel";
import "./design.css";
import "./responsive.css";

const sceneNames = { harbor: "苔原港", garden: "温室站" } as const;
export default function DesignStudio() {
  const [initialVersions] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const versions = readVersions(raw);
      return {
        versions,
        message: versions.length
          ? `已恢复最近保存的「${versions[versions.length - 1].name}」。`
          : "点击场景对象，开始你的第一版设计。",
      };
    } catch (error) {
      return {
        versions: [],
        message: error instanceof SyntaxError || (error instanceof Error && error.message.includes("格式"))
          ? "本地版本格式无效，已打开示例设计。原始存储未改写；你可以继续编辑与下载。"
          : "本地版本暂时无法读取。仍可编辑；保存会尝试重新写入。",
      };
    }
  });
  const latestVersion = initialVersions.versions.at(-1);
  const [state, setState] = useState<DesignState>(() =>
    latestVersion ? structuredClone(latestVersion.state) : createInitialState(),
  );
  const [versions, setVersions] = useState(initialVersions.versions);
  const [selectedId, setSelectedId] = useState(
    latestVersion
      ? latestVersion.state.objects[latestVersion.state.scene][0].id
      : "courier",
  );
  const [tab, setTab] = useState<InspectorTab>("object");
  const [message, setMessage] = useState(initialVersions.message);
  const [versionName, setVersionName] = useState(
    latestVersion?.name ?? "星港探索 · 第一版",
  );
  const [activeVersion, setActiveVersion] = useState(latestVersion?.id ?? "");
  const [dirty, setDirty] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<string | null>(
    null,
  );
  const palette = themes[state.theme];
  const objects = state.objects[state.scene];
  const selected =
    objects.find((object) => object.id === selectedId) ?? objects[0];
  const style = {
    "--ds-paper": palette.paper,
    "--ds-surface": palette.surface,
    "--ds-ink": palette.ink,
    "--ds-muted": palette.muted,
    "--ds-line": palette.line,
    "--ds-accent": palette.accent,
    "--ds-accent-ink": palette.accentInk,
    "--ds-mint": palette.mint,
    "--ds-sky": palette.sky,
  } as CSSProperties;

  function editState(update: (previous: DesignState) => DesignState) {
    setState(update);
    setDirty(true);
  }
  function updateObject(id: string, patch: Partial<SceneObject>) {
    editState((previous) => ({
      ...previous,
      objects: {
        ...previous.objects,
        [previous.scene]: previous.objects[previous.scene].map((object) =>
          object.id === id ? { ...object, ...patch } : object,
        ),
      },
    }));
  }
  function selectObject(id: string) {
    setSelectedId(id);
    setTab("object");
  }
  function changeScene(scene: SceneId) {
    editState((previous) => ({ ...previous, scene }));
    setSelectedId(state.objects[scene][0].id);
  }
  function handleObjectKey(
    event: KeyboardEvent<SVGGElement>,
    object: SceneObject,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectObject(object.id);
    }
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-2, 0],
      ArrowRight: [2, 0],
      ArrowUp: [0, -2],
      ArrowDown: [0, 2],
    };
    if (movement[event.key]) {
      event.preventDefault();
      selectObject(object.id);
      const [dx, dy] = movement[event.key];
      updateObject(object.id, {
        x: clamp(object.x + dx, 0, 100),
        y: clamp(object.y + dy, 0, 100),
      });
    }
  }
  function saveVersion(copy = false) {
    const name = `${versionName.trim() || "未命名版本"}${copy ? " · 副本" : ""}`;
    const saved = makeVersion(
      state,
      name,
      crypto.randomUUID(),
      new Date().toISOString(),
    );
    const next = appendVersion(versions, saved);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setVersions(next);
      setActiveVersion(saved.id);
      setVersionName(name);
      setDirty(false);
      setMessage(
        `已${copy ? "复制" : "保存"}「${name}」。此浏览器保留最近 12 个版本。`,
      );
    } catch {
      setMessage(
        "保存失败：浏览器存储不可用或空间不足。当前设计仍在页面中，可下载设计变量和介绍页。",
      );
    }
  }
  function restoreVersion(id: string) {
    const version = versions.find((item) => item.id === id);
    if (!version) return;
    setState(structuredClone(version.state));
    setSelectedId(version.state.objects[version.state.scene][0].id);
    setActiveVersion(id);
    setVersionName(version.name);
    setDirty(false);
    setGeneratedDocument(null);
    setMessage(`已载入「${version.name}」。`);
  }
  function addCargo() {
    const object: SceneObject = {
      id: crypto.randomUUID(),
      name: `补给货箱 ${objects.filter((item) => item.kind === "cargo").length + 1}`,
      kind: "cargo",
      x: 35,
      y: 75,
      scale: 0.8,
      visible: true,
    };
    editState((previous) => ({
      ...previous,
      objects: {
        ...previous.objects,
        [previous.scene]: [...previous.objects[previous.scene], object],
      },
    }));
    selectObject(object.id);
    setMessage("已添加一组货箱。可在属性面板调整位置和尺寸。");
  }

  return (
    <section
      className="design-studio"
      style={style}
      aria-label="游造设计工作台"
    >
      <header className="ds-header">
        <div className="ds-heading">
          <span className="ds-workspace-mark" aria-hidden="true">
            ✳
          </span>
          <div>
            <span className="ds-kicker">DESIGN WORKSPACE / 01</span>
            <h2>把想象，放进星港。</h2>
            <p>
              星港快递 <span>Starport Courier</span>
            </p>
          </div>
        </div>
        <div className="ds-header-actions">
          <span className={`ds-save-indicator ${dirty ? "is-dirty" : ""}`}>
            <i aria-hidden="true" />
            {dirty ? "有未保存修改" : "开始创造"}
          </span>
          <button
            className="ds-button ds-button-accent"
            onClick={() => saveVersion()}
          >
            <DesignIcon name="save" />
            保存版本
          </button>
        </div>
      </header>

      <div className="ds-workbench">
        <aside className="ds-library" aria-label="项目与场景">
          <div className="ds-panel-label">
            项目空间 <span>01</span>
          </div>
          <div className="ds-project">
            <span className="ds-project-icon" aria-hidden="true">
              ↗
            </span>
            <div>
              <strong>星港快递</strong>
              <small>原创探索 / 概念原型</small>
            </div>
          </div>
          <div className="ds-sidebar-title">
            场景 <span>SCENES</span>
          </div>
          <div className="ds-scenes">
            {(["harbor", "garden"] as SceneId[]).map((scene, index) => (
              <button
                key={scene}
                className={`ds-scene-button ${state.scene === scene ? "is-active" : ""}`}
                aria-pressed={state.scene === scene}
                onClick={() => changeScene(scene)}
              >
                <span className="ds-scene-number">0{index + 1}</span>
                <span>
                  {sceneNames[scene]}
                  <small>
                    {scene === "harbor"
                      ? "领取订单 · 起点"
                      : "送达补给 · 收件点"}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <div className="ds-sidebar-title">
            场景对象 <span>{String(objects.length).padStart(2, "0")}</span>
          </div>
          <div className="ds-objects" aria-label="选择场景对象">
            {objects.map((object) => (
              <button
                key={object.id}
                className={`ds-object-button ${selected.id === object.id ? "is-active" : ""}`}
                aria-pressed={selected.id === object.id}
                onClick={() => selectObject(object.id)}
              >
                <DesignIcon name={object.kind} />
                <span>{object.name}</span>
                {!object.visible && <small>隐藏</small>}
              </button>
            ))}
          </div>
          <button
            className="ds-add-button"
            onClick={addCargo}
            disabled={objects.length >= 30}
          >
            <DesignIcon name="plus" />
            添加货箱
          </button>
          <div className="ds-library-note">
            <span aria-hidden="true">✦</span>
            <p>
              每一箱货物，
              <br />
              都有一个等待它的人。
            </p>
            <small>WORLD NOTE / 001</small>
          </div>
        </aside>

        <div className="ds-canvas-column">
          <div className="ds-canvas-toolbar">
            <div>
              <span className="ds-live-dot" aria-hidden="true" />
              <strong>{sceneNames[state.scene]}</strong>
              <span className="ds-canvas-badge">等距场景</span>
            </div>
            <button
              className="ds-text-button"
              onClick={() => {
                editState((previous) => ({
                  ...previous,
                  objects: {
                    ...previous.objects,
                    [previous.scene]:
                      createInitialState().objects[previous.scene],
                  },
                }));
                setSelectedId(createInitialState().objects[state.scene][0].id);
                setMessage("已还原当前场景的对象，视觉主题和文档保留。");
              }}
            >
              还原场景 ↺
            </button>
          </div>
          <SceneCanvas
            scene={state.scene}
            objects={objects}
            selectedId={selected.id}
            palette={palette}
            onSelect={selectObject}
            onObjectKey={handleObjectKey}
          />
          <div className="ds-canvas-footer">
            <span>
              <kbd>↑ ↓ ← →</kbd> 选中对象后微调位置
            </span>
            <span>
              {objects.filter((object) => object.visible).length} 个可见对象{" "}
              <span aria-hidden="true">·</span> {palette.label}
            </span>
          </div>
          <div className="ds-version-bar">
            <div className="ds-version-name">
              <label htmlFor="ds-version-name">版本名称</label>
              <input
                id="ds-version-name"
                value={versionName}
                maxLength={80}
                onChange={(event) => setVersionName(event.target.value)}
              />
            </div>
            <div className="ds-version-history">
              <label htmlFor="ds-version-history">本地作品库</label>
              <select
                id="ds-version-history"
                value={activeVersion}
                onChange={(event) => restoreVersion(event.target.value)}
              >
                <option value="">
                  {versions.length ? "选择已保存版本" : "还没有保存的版本"}
                </option>
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="ds-button" onClick={() => saveVersion(true)}>
              复制当前版本
            </button>
          </div>
          <p className="ds-status" role="status">
            {message}
          </p>
        </div>

        <InspectorPanel
          state={state}
          selected={selected}
          tab={tab}
          setTab={setTab}
          editState={editState}
          updateObject={updateObject}
          setMessage={setMessage}
          generatedDocument={generatedDocument}
          setGeneratedDocument={setGeneratedDocument}
        />
      </div>
    </section>
  );
}
