import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { FetchedModel } from "../types";

function showFetchModelsError(error: unknown) {
  const message = String(error);
  if (message.includes("HTTP 401") || message.includes("HTTP 403")) {
    toast.error("API Key 无效或无权限");
  } else if (
    message.includes("All candidates failed") ||
    message.includes("HTTP 404") ||
    message.includes("HTTP 405")
  ) {
    toast.error(
      "未找到可用的模型列表端点，请检查 Base URL 或确认供应商是否开放该接口",
    );
  } else if (message.includes("timeout") || message.includes("timed out")) {
    toast.error("请求超时，请检查网络连接");
  } else if (message.includes("Failed to parse")) {
    toast.error("该供应商不支持获取模型列表");
  } else {
    toast.error("获取模型列表失败");
  }
}

export function useModelFetch(
  url: string,
  apiKey: string,
  fetchModels: (url: string, apiKey: string) => Promise<FetchedModel[]>,
) {
  const [models, setModels] = useState<FetchedModel[]>([]);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const requestSequence = useRef(0);
  const pending = useRef(false);

  useEffect(() => {
    setModels([]);
    setRefreshingModels(false);
    pending.current = false;
    return () => {
      // Ignore results from a previous endpoint, credential, or unmounted panel.
      requestSequence.current += 1;
    };
  }, [url, apiKey]);

  const refreshModels = async () => {
    const baseUrl = url.trim();
    const key = apiKey.trim();
    if (!baseUrl || !key) {
      toast.error(
        !baseUrl && !key
          ? "请先填写 API 端点和 API Key"
          : !key
            ? "请先填写 API Key"
            : "请先填写 API 端点",
      );
      return;
    }
    if (pending.current) return;
    pending.current = true;
    const sequence = ++requestSequence.current;
    setRefreshingModels(true);
    try {
      const fetched = await fetchModels(baseUrl, key);
      if (sequence !== requestSequence.current) return;
      setModels(fetched);
      if (fetched.length === 0) {
        toast.info("未找到可用模型");
      } else {
        toast.success(`获取到 ${fetched.length} 个模型`);
      }
    } catch (error) {
      if (sequence === requestSequence.current) showFetchModelsError(error);
    } finally {
      if (sequence === requestSequence.current) {
        pending.current = false;
        setRefreshingModels(false);
      }
    }
  };

  return { models, refreshingModels, refreshModels };
}
