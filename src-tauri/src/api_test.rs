use std::time::Duration;

use reqwest::{header, Client};
use serde_json::json;

const REQUEST_TIMEOUT: Duration = Duration::from_secs(20);

#[derive(serde::Serialize)]
pub struct ApiTestResult {
    pub success: bool,
    pub message: String,
}

pub async fn test_codex_config(url: String, api_key: String, model: String) -> ApiTestResult {
    let endpoint = format!("{}/v1/responses", api_root(&url));
    let client = Client::new();
    let request = client.post(endpoint).bearer_auth(api_key).json(&json!({
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
