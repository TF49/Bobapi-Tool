import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "pills";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === "pills") {
    return (
      <div
        className={cn(
          "inline-flex gap-1 rounded-xl border p-1 bg-slate-100 dark:bg-[#161928] border-slate-200 dark:border-white/10",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "light"
              ? "bg-white text-blue-600 shadow-sm font-semibold"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <Sun
            size={14}
            className={theme === "light" ? "text-amber-500" : ""}
          />
          浅色
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "dark"
              ? "bg-[#202538] text-blue-400 shadow-sm font-semibold"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <Moon size={14} className={theme === "dark" ? "text-blue-400" : ""} />
          深色
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            theme === "system"
              ? "bg-white dark:bg-[#202538] text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
              : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <Monitor size={14} />
          跟随系统
        </button>
      </div>
    );
  }

  // Quick icon button for titlebar
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded-lg border transition-all",
        "border-slate-200 dark:border-white/10",
        "bg-slate-100 hover:bg-slate-200 text-slate-700",
        "dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white",
        className,
      )}
      title={`当前为${isDark ? "深色模式" : "浅色模式"}，点击切换`}
    >
      {isDark ? (
        <Sun
          size={14}
          className="text-amber-400 transition-transform hover:rotate-45"
        />
      ) : (
        <Moon
          size={14}
          className="text-slate-700 transition-transform hover:-rotate-12"
        />
      )}
    </button>
  );
}

export default ThemeToggle;
