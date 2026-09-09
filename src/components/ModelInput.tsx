import { Input } from "./ui/Input";
import { RefreshCw } from "lucide-react";

interface ModelInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  placeholder: string;
  listId: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function ModelInput({
  value,
  onChange,
  suggestions,
  placeholder,
  listId,
  onRefresh,
  refreshing,
}: ModelInputProps) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        list={listId}
        className={onRefresh ? "font-mono pr-10" : "font-mono"}
      />
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title={refreshing ? "正在获取可用模型" : "刷新可用模型"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-40"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      )}
      <datalist id={listId}>
        {suggestions.map((model) => (
          <option key={model} value={model} />
        ))}
      </datalist>
    </div>
  );
}
