use std::path::PathBuf;
use serde_json::Value;
use crate::error::AppError;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct ClaudeConfig {
    pub base_url: String,
    pub api_key: String,
    pub config_exists: bool,
    pub config_path: String,
}

pub fn claude_config_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or_else(|| {
        AppError::ConfigNotFound("无法获取用户主目录".to_string())
    })?;
    Ok(home.join(".claude").join("settings.json"))
}

pub fn get_claude_config() -> Result<ClaudeConfig, AppError> {
    let path = claude_config_path()?;
    let config_path = path.display().to_string();
    let config_exists = path.exists();
    let mut base_url = String::new();
    let mut api_key = String::new();

    if config_exists {
        let content = std::fs::read_to_string(&path)?;
        let json: Value = serde_json::from_str(&content)?;

        if let Some(env) = json.get("env") {
            if let Some(url) = env.get("ANTHROPIC_BASE_URL") {
                base_url = url.as_str().unwrap_or("").to_string();
            }
            if let Some(key) = env.get("ANTHROPIC_AUTH_TOKEN") {
                api_key = key.as_str().unwrap_or("").to_string();
            }
        }
    }

    Ok(ClaudeConfig {
        base_url,
        api_key,
        config_exists,
        config_path,
    })
}

pub fn set_claude_config(url: String, api_key: String) -> Result<(), AppError> {
    let path = claude_config_path()?;

    // 读取现有 JSON，保留所有其他字段
    let mut json: Value = if path.exists() {
        let content = std::fs::read_to_string(&path)?;
        serde_json::from_str(&content)?
    } else {
        serde_json::json!({})
    };

    // 确保 env 对象存在
    if !json.get("env").is_some_and(|v| v.is_object()) {
        json["env"] = serde_json::json!({});
    }

    // 只更新这两个字段
    json["env"]["ANTHROPIC_BASE_URL"] = Value::String(url);
    json["env"]["ANTHROPIC_AUTH_TOKEN"] = Value::String(api_key);

    // 创建父目录（如果不存在）
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    std::fs::write(&path, serde_json::to_string_pretty(&json)?)?;
    Ok(())
}
