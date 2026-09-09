import { invoke } from "@tauri-apps/api/core";
import type { AgentConfig, ApiTestResult, NetworkStatus } from "../types";

export async function getCodexConfig(): Promise<AgentConfig> {
  return invoke<AgentConfig>("get_codex_config");
}

export async function setCodexConfig(
  url: string,
  apiKey: string,
): Promise<void> {
  return invoke("set_codex_config", { url, api_key: apiKey });
}

export async function getClaudeConfig(): Promise<AgentConfig> {
  return invoke<AgentConfig>("get_claude_config");
}

export async function setClaudeConfig(
  url: string,
  apiKey: string,
): Promise<void> {
  return invoke("set_claude_config", { url, api_key: apiKey });
}

export async function checkBobApiNetwork(): Promise<NetworkStatus> {
  return invoke<NetworkStatus>("check_bob_api_network");
}

export async function testCodexConfig(
  url: string,
  apiKey: string,
  model: string,
): Promise<ApiTestResult> {
  return invoke<ApiTestResult>("test_codex_config", {
    url,
    api_key: apiKey,
    model,
  });
}

export async function testClaudeConfig(
  url: string,
  apiKey: string,
  model: string,
): Promise<ApiTestResult> {
  return invoke<ApiTestResult>("test_claude_config", {
    url,
    api_key: apiKey,
    model,
  });
}

export async function fetchCodexModels(
  url: string,
  apiKey: string,
): Promise<string[]> {
  return invoke<string[]>("fetch_codex_models", { url, api_key: apiKey });
}

export async function fetchClaudeModels(
  url: string,
  apiKey: string,
): Promise<string[]> {
  return invoke<string[]>("fetch_claude_models", { url, api_key: apiKey });
}
