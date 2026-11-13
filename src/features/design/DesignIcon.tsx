import type { ObjectKind } from "./model";

export default function DesignIcon({
  name,
}: {
  name: ObjectKind | "layers" | "plus" | "arrow" | "save";
}) {
  const shapes = {
    ship: (
      <>
        <path d="m3 14 9-10 9 10-9 5-9-5Z" />
        <path d="M8 13h8M12 9v8" />
      </>
    ),
    tower: (
      <>
        <path d="M6 21V8l6-5 6 5v13M4 21h16M9 12h6M9 16h6" />
      </>
    ),
    cargo: (
      <>
        <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
        <path d="m3 7 9 5 9-5M12 12v9M7 5l10 5" />
      </>
    ),
    beacon: (
      <>
        <path d="m12 3 5 7-5 7-5-7 5-7ZM12 17v4M7 21h10M2 10h2M20 10h2" />
      </>
    ),
    layers: (
      <>
        <path d="m2 8 10-5 10 5-10 5L2 8ZM2 13l10 5 10-5M2 18l10 5 10-5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: (
      <>
        <path d="M4 12h16M14 6l6 6-6 6" />
      </>
    ),
    save: (
      <>
        <path d="M5 3h12l4 4v14H3V3h2ZM7 3v6h9V3M7 21v-7h10v7" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {shapes[name]}
    </svg>
  );
}
