import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, RefreshCw } from "lucide-react";
import {
  fetchClaudeModels,
  getClaudeConfig,
  setClaudeConfig,
  testClaudeConfig,
} from "../lib/api";
import { StatusBadge } from "./StatusBadge";
import { UrlSelector } from "./UrlSelector";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelInput } from "./ModelInput";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import { CLAUDE_MODEL_SUGGESTIONS, PRESET_URLS } from "../types";

export function ClaudePanel() {
  const [url, setUrl] = useState<string>(PRESET_URLS[0]);
  const [customUrl, setCustomUrl] = useState<string | undefined>();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [configExists, setConfigExists] = useState(false);
  const [configPath, setConfigPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<string[]>([...CLAUDE_MODEL_SUGGESTIONS]);
  const [refreshingModels, setRefreshingModels] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const cfg = await getClaudeConfig();
      const loadedUrl = cfg.base_url || PRESET_URLS[0];
      setUrl(loadedUrl);
      if (
        loadedUrl &&
        !(PRESET_URLS as readonly string[]).includes(loadedUrl)
      ) {
        setCustomUrl(loadedUrl);
      }
      setApiKey(cfg.api_key || "");
      setConfigExists(cfg.config_exists);
      setConfigPath(cfg.config_path);
    } catch (e) {
      toast.error(`读取配置失败: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const refreshModels = async () => {
    if (!url.trim() || !apiKey.trim()) return;
    setRefreshingModels(true);
    try {
      const fetched = await fetchClaudeModels(url.trim(), apiKey.trim());
      setModels(fetched);
      setModel((current) => (current.trim() ? current : fetched[0]));
    } catch {
      setModels([...CLAUDE_MODEL_SUGGESTIONS]);
    } finally {
      setRefreshingModels(false);
    }
  };

  useEffect(() => {
    if (!apiKey.trim()) return;
    const timer = window.setTimeout(() => void refreshModels(), 450);
    return () => window.clearTimeout(timer);
    // Refresh when credentials or endpoint change, matching cc-switch provider behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, apiKey]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.warning("请输入 API Key");
      return;
    }
    if (!model.trim()) {
      toast.warning("请选择或输入测试模型");
      return;
    }
    setSaving(true);
    try {
      const testResult = await testClaudeConfig(
        url,
        apiKey.trim(),
        model.trim(),
      );
      if (!testResult.success) {
        toast.error(`测试失败: ${testResult.message}`);
        return;
      }
      await setClaudeConfig(url, apiKey.trim());
      setConfigExists(true);
      toast.success(
        "测试通过，Claude Code 配置已保存，重启 Claude Code 后生效",
      );
    } catch (e) {
      toast.error(`保存失败: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-gray-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      {/* 配置文件状态 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>配置文件</Label>
          <button
            onClick={load}
            className="text-gray-600 hover:text-gray-400 transition-colors"
            title="刷新"
          >
            <RefreshCw size={13} />
          </button>
        </div>
        <StatusBadge exists={configExists} path={configPath} />
        {!configExists && (
          <p className="text-xs text-yellow-500/80 px-1">
            ⚠ 未检测到 Claude Code 配置文件，将自动创建。
          </p>
        )}
      </div>

      {/* API 节点选择 */}
      <div className="space-y-1.5">
        <Label>API 节点</Label>
        <UrlSelector value={url} customUrl={customUrl} onChange={setUrl} />
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <Label>API Key</Label>
        <ApiKeyInput
          value={apiKey}
          onChange={setApiKey}
          placeholder="ANTHROPIC_AUTH_TOKEN"
        />
        <p className="text-xs text-gray-600 px-1">
          Key 将写入{" "}
          <code className="text-gray-500">~/.claude/settings.json</code> 的 env
          字段
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>测试模型</Label>
        <ModelInput
          value={model}
          onChange={setModel}
          suggestions={models}
          placeholder="选择或输入模型名称"
          listId="claude-models"
          onRefresh={() => void refreshModels()}
          refreshing={refreshingModels}
        />
        <p className="text-xs text-gray-600 px-1">
          保存前将使用该模型发送一次 Hi 测试。
        </p>
      </div>

      {/* 保存按钮 */}
      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="animate-spin mr-2" size={14} />
            测试并保存中...
          </>
        ) : (
          <>
            <Save size={14} className="mr-2" />
            保存配置
          </>
        )}
      </Button>
    </div>
  );
}
