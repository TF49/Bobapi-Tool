use std::time::Duration;

const BOB_API_URL: &str = "https://bob-api.com/";
const CHECK_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(serde::Serialize)]
pub struct NetworkStatus {
    pub reachable: bool,
}

pub async fn check_bob_api_network() -> NetworkStatus {
    // Build HTTP client with timeout configuration
    let client = match reqwest::Client::builder()
        .timeout(CHECK_TIMEOUT)
        .build()
    {
        Ok(c) => c,
        Err(_) => return NetworkStatus { reachable: false },
    };

    // Attempt HTTPS GET request to validate actual HTTP-level connectivity
    let reachable = match client.get(BOB_API_URL).send().await {
        Ok(response) => response.status().is_success(),
        Err(_) => false,
    };

    NetworkStatus { reachable }
}
