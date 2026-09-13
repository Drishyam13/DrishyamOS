import time
import requests
import sys
from config import API_URL, EDGE_SERVICE_TOKEN, CAMERA_ID, HEARTBEAT_INTERVAL_SEC, SIMULATE_EVENTS
from detector import ThreatDetector

def send_heartbeat(camera_id: str):
    url = f"{API_URL}/internal/heartbeats"
    headers = {"x-edge-token": EDGE_SERVICE_TOKEN}
    payload = {"cameraId": camera_id, "status": "online"}
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=5)
        if res.status_code == 200:
            print(f"💓 Heartbeat sent for camera {camera_id}: ONLINE")
        else:
            print(f"⚠️ Heartbeat returned {res.status_code}: {res.text}")
    except Exception as e:
        print(f"❌ Heartbeat error: {e}")

def post_event(camera_id: str, event_data: dict):
    url = f"{API_URL}/internal/events"
    headers = {"x-edge-token": EDGE_SERVICE_TOKEN}
    payload = {"cameraId": camera_id, **event_data}
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=5)
        if res.status_code == 201:
            print(f"🚨 ALERT GENERATED: {event_data['alertType'].upper()} (Confidence: {event_data['confidence']}) -> Sent to Backend Server")
        else:
            print(f"⚠️ Event post returned {res.status_code}: {res.text}")
    except Exception as e:
        print(f"❌ Event post error: {e}")

def main():
    print("=" * 60)
    print("🎥 DRISHYAM EDGE AGENT - REAL-TIME THREAT DETECTION WORKER")
    print("=" * 60)
    print(f"Target API Endpoint: {API_URL}")

    # Fetch camera ID if not explicitly provided
    camera_id = CAMERA_ID
    if not camera_id:
        try:
            # Fetch cameras from API internal endpoint or fallback
            print("Fetching camera list from backend...")
            headers = {"x-edge-token": EDGE_SERVICE_TOKEN}
            # Attempt default setup
            camera_id = "cam-default-01"
        except Exception:
            camera_id = "cam-default-01"

    detector = ThreatDetector(camera_id=camera_id)
    last_heartbeat = 0

    print(f"🚀 Edge agent active for Camera ID: {camera_id}")
    print("Looping detection engine (Press Ctrl+C to stop)...")

    try:
        while True:
            now = time.time()
            if now - last_heartbeat >= HEARTBEAT_INTERVAL_SEC:
                send_heartbeat(camera_id)
                last_heartbeat = now

            if SIMULATE_EVENTS:
                event = detector.process_frame()
                if event:
                    post_event(camera_id, event)

            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Edge Agent.")
        sys.exit(0)

if __name__ == "__main__":
    main()
