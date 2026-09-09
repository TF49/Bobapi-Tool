use std::time::Duration;

use tokio::{net::TcpStream, time::timeout};

const BOB_API_ADDRESS: &str = "bob-api.com:443";
const CHECK_TIMEOUT: Duration = Duration::from_secs(5);

#[derive(serde::Serialize)]
pub struct NetworkStatus {
    pub reachable: bool,
}

pub async fn check_bob_api_network() -> NetworkStatus {
    let reachable = matches!(
        timeout(CHECK_TIMEOUT, TcpStream::connect(BOB_API_ADDRESS)).await,
        Ok(Ok(_))
    );

    NetworkStatus { reachable }
}
