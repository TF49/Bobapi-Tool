use std::time::Duration;

use reqwest::{header, Client};
use serde::Deserialize;
use serde_json::json;

const REQUEST_TIMEOUT: Duration = Duration::from_secs(20);

#[derive(serde::Serialize)]
pub struct ApiTestResult {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Deserialize)]
struct ModelsResponse {
    data: Option<Vec<ModelEntry>>,
}

#[derive(Debug, Deserialize)]
struct ModelEntry {
    id: String,
}

pub async fn fetch_codex_models(url: String, api_key: String) -> Result<Vec<String>, String> {
    fetch_models(url, api_key, false).await
}

pub async fn fetch_claude_models(url: String, api_key: String) -> Result<Vec<String>, String> {
    fetch_models(url, api_key, true).await
}

async fn fetch_models(url: String, api_key: String, anthropic: bool) -> Result<Vec<String>, String> {
    let endpoints = model_endpoints(&url);
    let client = Client::new();
    let mut last_status = None;

    for endpoint in endpoints {
        let mut request = client.get(endpoint).timeout(REQUEST_TIMEOUT);
        request = if anthropic {
            request
                .header("x-api-key", &api_key)
                .header("anthropic-version", "2023-06-01")
        } else {
            request.bearer_auth(&api_key)
        };

        let response = request
            .send()
            .await
            .map_err(|_| "连接失败或请求超时".to_string())?;
        let status = response.status();
        if status == reqwest::StatusCode::NOT_FOUND
            || status == reqwest::StatusCode::METHOD_NOT_ALLOWED
        {
            last_status = Some(status);
            continue;
        }
        if !status.is_success() {
            return Err(format!("服务返回 HTTP {}", status));
        }

        let payload: ModelsResponse = response
            .json()
            .await
            .map_err(|_| "模型列表响应格式无法识别".to_string())?;
        let mut models: Vec<String> = payload
            .data
            .unwrap_or_default()
            .into_iter()
            .map(|entry| entry.id.trim().to_string())
            .filter(|id| !id.is_empty())
            .collect();
        models.sort();
        models.dedup();

        if models.is_empty() {
            return Err("服务未返回可用模型".to_string());
        }
        return Ok(models);
    }

    Err(format!(
        "模型列表端点不可用{}",
        last_status
            .map(|status| format!("（最后响应 HTTP {status}）"))
            .unwrap_or_default()
    ))
}

fn model_endpoints(url: &str) -> Vec<String> {
    let base = url.trim().trim_end_matches('/');
    let mut endpoints = Vec::new();
    let last_segment = base.rsplit('/').next().unwrap_or_default();
    if last_segment.strip_prefix('v').is_some_and(|digits| {
        !digits.is_empty() && digits.bytes().all(|byte| byte.is_ascii_digit())
    }) {
        endpoints.push(format!("{base}/models"));
        if !base.ends_with("/v1") {
            endpoints.push(format!("{base}/v1/models"));
        }
    } else {
        endpoints.push(format!("{base}/v1/models"));
        endpoints.push(format!("{base}/models"));
    }

    for suffix in ["/api/anthropic", "/apps/anthropic", "/api/claudecode", "/anthropic", "/claude"] {
        if let Some(root) = base.strip_suffix(suffix) {
            if !root.is_empty() {
                endpoints.push(format!("{root}/v1/models"));
                endpoints.push(format!("{root}/models"));
            }
            break;
        }
    }

    let mut unique = Vec::with_capacity(endpoints.len());
    for endpoint in endpoints {
        if !unique.iter().any(|existing| existing == &endpoint) {
            unique.push(endpoint);
        }
    }
    unique
}

pub async fn test_codex_config(url: String, api_key: String, model: String) -> ApiTestResult {
    let endpoint = format!("{}/v1/responses", api_root(&url));
    let client = Client::new();
    let request = client
        .post(endpoint)
        .bearer_auth(api_key)
        .json(&json!({
            "model": model,
            "input": "Hi",
        }));

    send_test_request(request).await
}

pub async fn test_claude_config(url: String, api_key: String, model: String) -> ApiTestResult {
    let endpoint = format!("{}/v1/messages", api_root(&url));
    let client = Client::new();
    let request = client
        .post(endpoint)
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header(header::CONTENT_TYPE, "application/json")
        .json(&json!({
            "model": model,
            "max_tokens": 16,
            "messages": [{ "role": "user", "content": "Hi" }],
        }));

    send_test_request(request).await
}

fn api_root(url: &str) -> &str {
    let trimmed = url.trim_end_matches('/');
    trimmed.strip_suffix("/v1").unwrap_or(trimmed)
}

async fn send_test_request(request: reqwest::RequestBuilder) -> ApiTestResult {
    match request.timeout(REQUEST_TIMEOUT).send().await {
        Ok(response) if response.status().is_success() => ApiTestResult {
            success: true,
            message: "测试成功".to_string(),
        },
        Ok(response) => ApiTestResult {
            success: false,
            message: format!("服务返回 HTTP {}", response.status()),
        },
        Err(_) => ApiTestResult {
            success: false,
            message: "连接失败或请求超时".to_string(),
        },
    }
}
