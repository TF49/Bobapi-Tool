import { useState } from "react";
import { Server, Globe, Check, Edit3, Plus } from "lucide-react";
import { PRESET_URLS } from "../types";
import { cn } from "../lib/utils";

interface NodeCardSelectorProps {
  value: string;
  customUrl?: string;
  onChange: (url: string) => void;
  accentColor?: "blue" | "purple";
}

const NODE_META: Record<
  string,
  { name: string; tag: string; description: string }
> = {
  "https://bob-api.com/": {
    name: "BobAPI 官方节点",
    tag: "推荐",
    description: "官方主力线路，稳定低延迟",
  },
  "https://taijiai.online/": {
    name: "TaijiAI 加速节点",
    tag: "备用专线",
    description: "国内高速直连，全协议兼容",
  },
};

export function NodeCardSelector({
  value,
  customUrl,
  onChange,
  accentColor = "blue",
}: NodeCardSelectorProps) {
  const isCustomValue = !(PRESET_URLS as readonly string[]).includes(value);
  const activeCustomUrl = customUrl || (isCustomValue ? value : "");
  const [editingCustom, setEditingCustom] = useState(false);
  const [customInput, setCustomInput] = useState(activeCustomUrl);

  const handleApplyCustom = () => {
    let clean = customInput.trim();
    if (!clean) return;
    if (!clean.endsWith("/")) {
      clean += "/";
    }
    onChange(clean);
    setEditingCustom(false);
  };

  const isBlue = accentColor === "blue";

  return (
    <div className="space-y-2.5">
      {/* 预设节点卡片列表 */}
      <div className="grid grid-cols-1 gap-2">
        {PRESET_URLS.map((url) => {
          const selected = value === url;
          const meta = NODE_META[url] || {
            name: "API 节点",
            tag: "专线",
            description: url,
          };

          return (
            <button
              key={url}
              type="button"
              onClick={() => onChange(url)}
              className={cn(
                "group relative w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200",
                selected
                  ? isBlue
                    ? "border-blue-500 bg-blue-50/80 dark:bg-blue-500/10 dark:border-blue-500/80 shadow-sm dark:shadow-[0_0_20px_rgba(10,132,255,0.15)]"
                    : "border-purple-500 bg-purple-50/80 dark:bg-purple-500/10 dark:border-purple-500/80 shadow-sm dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                  : "border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-[#141724]/60 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#191c2b]/80",
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* 节点图标 */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    selected
                      ? isBlue
                        ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300"
                      : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-300",
                  )}
                >
                  <Server size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium transition-colors",
                        selected
                          ? "text-slate-900 dark:text-white font-semibold"
                          : "text-slate-700 dark:text-gray-300 group-hover:text-slate-900 dark:group-hover:text-white",
                      )}
                    >
                      {meta.name}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-mono font-medium",
                        selected
                          ? isBlue
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                            : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-white/10",
                      )}
                    >
                      {meta.tag}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 dark:text-gray-400 block truncate mt-0.5">
                    {url}
                  </span>
                </div>
              </div>

              {/* 选中指示圆点 */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ml-3",
                  selected
                    ? isBlue
                      ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white"
                      : "border-purple-600 dark:border-purple-500 bg-purple-600 dark:bg-purple-500 text-white"
                    : "border-slate-300 dark:border-white/20 bg-transparent group-hover:border-slate-400 dark:group-hover:border-white/40",
                )}
              >
                {selected && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          );
        })}

        {/* 自定义节点卡片 */}
        {activeCustomUrl && !editingCustom ? (
          <div
            onClick={() => onChange(activeCustomUrl)}
            className={cn(
              "group relative w-full flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-200",
              isCustomValue
                ? "border-amber-500 bg-amber-50/80 dark:bg-amber-500/10 dark:border-amber-500/80 shadow-sm dark:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                : "border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-[#141724]/60 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#191c2b]/80 text-slate-700 dark:text-gray-400",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  isCustomValue
                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400",
                )}
              >
                <Globe size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCustomValue
                        ? "text-slate-900 dark:text-white font-semibold"
                        : "text-slate-700 dark:text-gray-300",
                    )}
                  >
                    自定义专线节点
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    自定义
                  </span>
                </div>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-200/80 block truncate mt-0.5">
                  {activeCustomUrl}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomInput(activeCustomUrl);
                  setEditingCustom(true);
                }}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                title="修改自定义地址"
              >
                <Edit3 size={14} />
              </button>
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center border transition-all",
                  isCustomValue
                    ? "border-amber-500 bg-amber-500 text-white dark:text-black"
                    : "border-slate-300 dark:border-white/20 bg-transparent",
                )}
              >
                {isCustomValue && <Check size={12} strokeWidth={3} />}
              </div>
            </div>
          </div>
        ) : editingCustom ? (
          <div className="p-3.5 rounded-xl border border-amber-500/50 bg-amber-50/40 dark:bg-[#171a26] space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Globe size={13} />
                输入自定义 API Base URL
              </span>
              <button
                type="button"
                onClick={() => setEditingCustom(false)}
                className="text-slate-500 dark:text-gray-500 hover:text-slate-800 dark:hover:text-gray-300"
              >
                取消
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="https://your-custom-proxy.com/"
                className="flex-1 h-8 rounded-lg bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 px-2.5 text-xs font-mono text-slate-900 dark:text-gray-200 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleApplyCustom}
                className="h-8 px-3 rounded-lg bg-amber-500 text-white dark:text-black font-medium text-xs hover:bg-amber-600 dark:hover:bg-amber-400 transition-colors flex-shrink-0"
              >
                确定
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingCustom(true)}
            className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 text-xs text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 flex items-center justify-center gap-1.5 transition-colors bg-slate-50/60 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.04]"
          >
            <Plus size={13} />
            添加自定义中转节点
          </button>
        )}
      </div>
    </div>
  );
}

export default NodeCardSelector;
