import { cn } from "../lib/utils";
import { PRESET_URLS } from "../types";

interface UrlSelectorProps {
  value: string;
  customUrl?: string;
  onChange: (url: string) => void;
}

export function UrlSelector({ value, customUrl, onChange }: UrlSelectorProps) {
  // 综合外部传入与当前值的自定义 URL
  const activeCustomUrl =
    customUrl ||
    (!(PRESET_URLS as readonly string[]).includes(value) ? value : undefined);
  const showCustomOption =
    activeCustomUrl &&
    !(PRESET_URLS as readonly string[]).includes(activeCustomUrl);

  return (
    <div className="space-y-2">
      {PRESET_URLS.map((url) => {
        const selected = value === url;
        return (
          <button
            key={url}
            type="button"
            onClick={() => onChange(url)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
              selected
                ? "border-blue-500 bg-blue-500/10 text-blue-300"
                : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:border-[#3a3a3a] hover:text-gray-300",
            )}
          >
            {/* Radio circle */}
            <span
              className={cn(
                "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                selected ? "border-blue-500" : "border-gray-600",
              )}
            >
              {selected && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </span>
            <span className="text-sm font-mono">{url}</span>
          </button>
        );
      })}

      {/* 当前值不在预设列表时，渲染为可交互的自定义单选项 */}
      {showCustomOption && (
        <button
          type="button"
          onClick={() => onChange(activeCustomUrl)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
            value === activeCustomUrl
              ? "border-yellow-500/80 bg-yellow-500/10 text-yellow-300"
              : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:border-yellow-500/40 hover:text-yellow-400",
          )}
        >
          <span
            className={cn(
              "w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
              value === activeCustomUrl
                ? "border-yellow-500"
                : "border-gray-600",
            )}
          >
            {value === activeCustomUrl && (
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
            )}
          </span>
          <span className="text-sm font-mono truncate flex-1">
            {activeCustomUrl}
          </span>
          <span className="text-xs text-yellow-500/80 flex-shrink-0">
            （当前自定义）
          </span>
        </button>
      )}
    </div>
  );
}
