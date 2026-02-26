# Pi IP Address: 10.145.46.65
#
# This script runs on the Raspberry Pi 5 and demonstrates how to
# capture a still from the Picamera2 API, save it locally, and then
# POST it to the backend service defined in this repository.
#
# Before running:
#   * install picamera2 and requests packages on the Pi (`pip install picamera2 requests`)
#   * set UPLOAD_URL to the URL of your backend (e.g. http://192.168.1.100:3000/api/upload-image)
#   * set PI_API_KEY to the same key configured in the server's .env file
#   * make sure the backend is running and reachable from the Pi

from picamera2 import Picamera2
import time
import requests
import os
from datetime import datetime
import sys

# Get the directory where this script lives (src/Pi/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------- configuration ----------
# HTTP endpoint exposed by the backend (adjust host/port as necessary)
UPLOAD_URL = "http://<BACKEND_IP_OR_HOST>:<PORT>/upload-image"
# same key that the server expects (see .env PI_API_KEY)
PI_API_KEY = "<your_pi_api_key_here>"

# ---------- helper functions ----------
def log(message: str):
    """Print timestamped log message to terminal."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {message}")
    sys.stdout.flush()  # ensure immediate output


def take_picture(camera_index: int = 0, filename: str | None = None) -> str:
    """Capture a still image from the specified camera and return the
    path to the saved file. If *filename* is omitted one will be
    generated using a timestamp and saved to the Pi folder.
    """
    try:
        log(f"Initializing camera {camera_index}...")
        cam = Picamera2(camera_index)
        config = cam.create_still_configuration()
        cam.configure(config)
        cam.start()
        log(f"Camera {camera_index} started. Waiting for sensor to warm up...")
        # allow sensor to warm up
        time.sleep(2)

        if filename is None:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S.jpg")
            filename = os.path.join(SCRIPT_DIR, ts)

        log(f"Capturing image to: {filename}")
        cam.capture_file(filename)
        log(f"Image captured successfully")
        cam.stop()
        return filename
    except Exception as e:
        log(f"ERROR during capture: {str(e)}")
        raise


def upload_file(filepath: str) -> requests.Response:
    """POST *filepath* to the backend using multipart/form-data."""
    try:
        log(f"Uploading file to: {UPLOAD_URL}")
        with open(filepath, "rb") as f:
            files = {"image": f}
            headers = {"x-api-key": PI_API_KEY}
            log(f"Sending POST request...")
            response = requests.post(UPLOAD_URL, files=files, headers=headers)
            log(f"Upload returned HTTP {response.status_code}")
            if response.status_code == 200:
                log("Successfully uploaded to backend")
            else:
                log(f"Upload failed: {response.text}")
        return response
    except requests.exceptions.ConnectionError:
        log(f"ERROR: Could not connect to {UPLOAD_URL}. Is the backend running?")
        raise
    except Exception as e:
        log(f"ERROR during upload: {str(e)}")
        raise


# ---------- main script ----------
if __name__ == "__main__":
    log("="*60)
    log("MakerSpace Pi Camera Capture & Upload")
    log("="*60)
    log(f"Script directory: {SCRIPT_DIR}")
    log(f"Backend URL: {UPLOAD_URL}")
    
    # sanity check configuration
    if "<BACKEND_IP_OR_HOST>" in UPLOAD_URL or "<your_pi_api_key_here>" in PI_API_KEY:
        log("ERROR: Configuration incomplete")
        raise RuntimeError(
            "Please set UPLOAD_URL and PI_API_KEY at the top of this script before running"
        )

    try:
        local_file = take_picture()
        log(f"Image saved to: {local_file}")
        log("-"*60)
        upload_file(local_file)
        log("-"*60)
        log("All operations completed successfully")
    except Exception as e:
        log(f"Fatal error: {str(e)}")
        sys.exit(1)
    finally:
        log("="*60)
