import os

API_URL = os.getenv("API_URL", "http://localhost:4000/api/v1")
if not API_URL.startswith("http://") and not API_URL.startswith("https://"):
    API_URL = f"https://{API_URL}/api/v1"

EDGE_SERVICE_TOKEN = os.getenv("EDGE_SERVICE_TOKEN", "drishyam-edge-service-secret-token-123")
CAMERA_ID = os.getenv("CAMERA_ID", "")
HEARTBEAT_INTERVAL_SEC = int(os.getenv("HEARTBEAT_INTERVAL_SEC", "10"))
SIMULATE_EVENTS = os.getenv("SIMULATE_EVENTS", "true").lower() == "true"
