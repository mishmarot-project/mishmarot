"use client";

interface MobileViewToggleProps {
  activeView: "feed" | "map";
  onToggle: (view: "feed" | "map") => void;
}

export function MobileViewToggle({ activeView, onToggle }: MobileViewToggleProps) {
  return (
    <div className="flex border-b border-neutral-800 lg:hidden">
      <button
        type="button"
        onClick={() => onToggle("feed")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${
          activeView === "feed"
            ? "text-neutral-100 border-b-2 border-blue-500"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Feed
      </button>
      <button
        type="button"
        onClick={() => onToggle("map")}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${
          activeView === "map"
            ? "text-neutral-100 border-b-2 border-blue-500"
            : "text-neutral-400 hover:text-neutral-200"
        }`}
      >
        Map
      </button>
    </div>
  );
}
