import type { KeyboardEvent } from "react";
import type { SceneId, SceneObject, ThemeId, themes } from "./model";

const sceneNames = { harbor: "苔原港", garden: "温室站" } as const;

interface SceneCanvasProps {
  scene: SceneId;
  objects: SceneObject[];
  selectedId: string;
  palette: (typeof themes)[ThemeId];
  onSelect: (id: string) => void;
  onObjectKey: (event: KeyboardEvent<SVGGElement>, object: SceneObject) => void;
}

function ObjectDrawing({
  object,
  palette,
}: {
  object: SceneObject;
  palette: (typeof themes)[ThemeId];
}) {
  const p = palette;
  if (object.kind === "tower")
    return (
      <>
        <ellipse cx="0" cy="39" rx="52" ry="20" fill={p.shadow} opacity=".24" />
        <path
          d="m-40 20 40-21 40 21-40 23Z"
          fill={p.mint}
          stroke={p.ink}
          strokeWidth="1.2"
        />
        <path
          d="M-24 16v-78L0-76l24 14v78L0 30Z"
          fill={p.surface}
          stroke={p.ink}
          strokeWidth="1.6"
        />
        <path
          d="M0-76v106l24-14v-78Z"
          fill={p.line}
          stroke={p.ink}
          strokeWidth="1.4"
        />
        <path
          d="m-31-63 31-18 31 18L0-45Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="1.6"
        />
        <path
          d="m-31-63 31 18v10l-31-18ZM0-45l31-18v10L0-35Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="1.4"
        />
        <path
          d="M-14-24v18l8 4v-18ZM-14 3v13l8 5V7"
          fill={p.sky}
          stroke={p.ink}
          strokeWidth="1.2"
        />
        <path d="m8-25 8-5v16l-8 5ZM8 0l8-5v14l-8 5Z" fill={p.accent} />
        <path
          d="M0-81v-17M0-98l18-5v11L0-87"
          fill={p.mint}
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path
          d="m-50 28-13-10m8 20-15-3M44 27l12-9"
          stroke={p.ink}
          strokeWidth="1.5"
        />
      </>
    );
  if (object.kind === "ship")
    return (
      <>
        <ellipse cx="0" cy="36" rx="57" ry="17" fill={p.shadow} opacity=".22" />
        <path
          d="m-37 9-21 17 34-4M31 7l28 16-33-2"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="1.6"
        />
        <path
          d="m-43-3 39-20 45 27-37 27-47-23Z"
          fill={p.surface}
          stroke={p.ink}
          strokeWidth="1.7"
        />
        <path
          d="m-43-3 47 22 37-15v12L4 37-43 8Z"
          fill={p.line}
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path
          d="m-22-8 18-10 24 15L2 8Z"
          fill={p.mint}
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path d="m-12 12 10 5v11l-10-5ZM13 17l11-6v9l-11 7Z" fill={p.accent} />
        <path
          d="m-28 21-7 16m9-14-1 12m46-10 7 12"
          stroke={p.accent}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path d="M-32-1-7 11M14 7l12-6" stroke={p.ink} strokeWidth="1.3" />
      </>
    );
  if (object.kind === "cargo")
    return (
      <>
        <ellipse cx="0" cy="28" rx="40" ry="14" fill={p.shadow} opacity=".2" />
        <path
          d="m-35 2 21-12 21 12v26l-21 12-21-12Z"
          fill={p.accent}
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path
          d="m-35 2 21 12L7 2M-14 14v26M-26-3l21 12"
          fill="none"
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path
          d="m-2-12 21-12 21 12v25L19 26-2 13Z"
          fill={p.mint}
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path
          d="m-2-12 21 12 21-12M19 0v26M8-18l22 12"
          fill="none"
          stroke={p.ink}
          strokeWidth="1.5"
        />
        <path d="m23 5 9-5v9l-9 5ZM-29 15l7 4v7l-7-4Z" fill={p.surface} />
      </>
    );
  return (
    <>
      <ellipse cx="0" cy="30" rx="24" ry="10" fill={p.shadow} opacity=".24" />
      <path
        d="m-21 22 21-11 21 11L0 34Z"
        fill={p.line}
        stroke={p.ink}
        strokeWidth="1.5"
      />
      <path
        d="M-5 21v-40l5-3 5 3v40l-5 3Z"
        fill={p.surface}
        stroke={p.ink}
        strokeWidth="1.5"
      />
      <path
        d="m0-54 17 23L0-10l-17-21Z"
        fill={p.mint}
        stroke={p.ink}
        strokeWidth="1.5"
      />
      <path
        d="M0-54v44l17-21Z"
        fill={p.accent}
        stroke={p.ink}
        strokeWidth="1.3"
      />
      <path
        d="M-27-31h-9M27-31h9M0-63v-9"
        stroke={p.accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </>
  );
}

export default function SceneCanvas({
  scene,
  objects,
  selectedId,
  palette,
  onSelect,
  onObjectKey,
}: SceneCanvasProps) {
  return (
    <div className="ds-canvas">
      <div className="ds-scene-caption">
        <span>FIELD NOTES</span>
        <strong>
          {scene === "harbor" ? "下一站，有人等你。" : "把新鲜，送进星海。"}
        </strong>
        <small>
          {scene === "harbor"
            ? "TUNDRA PORT · DEPARTURE"
            : "GREENHOUSE · ARRIVAL"}
        </small>
      </div>
      <svg
        className="ds-scene"
        viewBox="0 0 780 480"
        aria-label={`${sceneNames[scene]}场景，可选择对象并用方向键移动`}
      >
        <defs>
          <pattern
            id="ds-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".7" fill={palette.ink} opacity=".15" />
          </pattern>
        </defs>
        <rect width="780" height="480" fill={palette.sky} />
        <rect width="780" height="480" fill="url(#ds-grid)" />
        <ellipse
          cx="392"
          cy="298"
          rx="320"
          ry="110"
          fill="none"
          stroke={palette.ink}
          strokeDasharray="4 7"
          opacity=".2"
        />
        <path
          d="m103 252 278-128 303 132-274 144Z"
          fill={palette.shadow}
          opacity=".17"
        />
        <path
          d="m112 226 269-126 298 130v29L410 388 112 255Z"
          fill={palette.shadow}
          stroke={palette.ink}
          strokeWidth="1.5"
        />
        <path
          d="m112 226 269-126 298 130-269 129Z"
          fill={palette.paper}
          stroke={palette.ink}
          strokeWidth="1.5"
        />
        <path
          d="m410 359 269-129v29L410 388Z"
          fill={palette.line}
          stroke={palette.ink}
          strokeWidth="1.5"
        />
        <g fill="none" stroke={palette.line} strokeWidth="1.2">
          <path d="m170 198 299 133M229 171l299 133M289 143l299 133M350 115l299 133M173 253l269-127M232 281l269-128M291 307l269-128M350 333l269-128" />
        </g>
        <path
          d="m196 238 128-61 199 87 92-43"
          fill="none"
          stroke={palette.accent}
          strokeWidth="3"
          strokeDasharray="8 7"
          opacity=".7"
        />
        <path
          d="m348 151 37-17 47 21-37 18Z"
          fill={palette.mint}
          opacity=".7"
        />
        <path
          d="m525 273 39-18 45 20-39 19Z"
          fill={palette.mint}
          opacity=".75"
        />
        <g fill={palette.mint} stroke={palette.ink} strokeWidth="1.1">
          <path d="m157 246-13-21 17 8-1-22 14 27-9 14Z" />
          <path d="m568 204-8-22 15 11 4-24 9 35-10 5Z" />
          <path d="m383 328-16-21 15 6 9-22 4 28-6 12Z" />
        </g>
        <g stroke={palette.ink} strokeWidth="1.2" fill="none" opacity=".45">
          <path d="M94 131h14m-7-7v14M695 333h14m-7-7v14M661 112h10m-5-5v10" />
          <circle cx="628" cy="387" r="4" />
          <circle cx="135" cy="368" r="3" />
        </g>
        {scene === "garden" && (
          <g fill={palette.mint} stroke={palette.ink} strokeWidth="1.3">
            <path d="m442 218 50-24 53 25-51 25Z" />
            <path
              d="M442 218v-28q50-65 103 1v28l-51 25Z"
              fill={palette.mint}
              opacity=".6"
            />
            <path d="M494 244v-86M462 228v-59M523 230v-56" fill="none" />
          </g>
        )}
        {[...objects]
          .sort((a, b) => a.y - b.y)
          .filter((object) => object.visible)
          .map((object) => (
            <g
              key={object.id}
              className={`ds-scene-object ${object.id === selectedId ? "is-selected" : ""}`}
              role="button"
              aria-label={`选择${object.name}，方向键移动`}
              aria-pressed={object.id === selectedId}
              tabIndex={0}
              transform={`translate(${170 + object.x * 4.4} ${130 + object.y * 2.3}) scale(${object.scale})`}
              onClick={() => onSelect(object.id)}
              onKeyDown={(event) => onObjectKey(event, object)}
            >
              <title>{object.name}</title>
              <ellipse
                className="ds-selection-ring"
                cy="31"
                rx="64"
                ry="27"
                fill="none"
                stroke={palette.accent}
                strokeWidth="2"
                strokeDasharray="5 4"
              />
              <rect
                className="ds-object-hit"
                x="-62"
                y="-110"
                width="124"
                height="160"
                fill="transparent"
              />
              <ObjectDrawing object={object} palette={palette} />
              {selectedId === object.id && (
                <g transform="translate(0 68)">
                  <rect
                    x="-58"
                    y="-13"
                    width="116"
                    height="26"
                    rx="13"
                    fill={palette.ink}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={palette.paper}
                    fontSize="12"
                    fontFamily="system-ui"
                  >
                    {object.name.length > 9
                      ? `${object.name.slice(0, 9)}…`
                      : object.name}
                  </text>
                </g>
              )}
            </g>
          ))}
        <text
          x="32"
          y="453"
          fill={palette.muted}
          fontSize="11"
          letterSpacing="2"
          fontFamily="monospace"
        >
          SC — {scene === "harbor" ? "001" : "002"} / YOUZAO
        </text>
        <text
          x="748"
          y="453"
          textAnchor="end"
          fill={palette.muted}
          fontSize="11"
          fontFamily="monospace"
        >
          1 : 1 / ISOMETRIC
        </text>
      </svg>
    </div>
  );
}
