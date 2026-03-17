#!/usr/bin/env python3
"""
Raspberry Pi Dual Camera Upload Script
Captures images from two Camera Module 2 cameras simultaneously and uploads them
to the backend server via separate POST requests.
Uses picamera2 library with threading for concurrent camera access.
"""

import os
import sys
import time
import logging
import threading
from datetime import datetime

import requests
from picamera2 import Picamera2
from dotenv import load_dotenv

# ============================================================================
# Configuration
# ============================================================================

# Load environment variables from .env file in the same directory as this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(SCRIPT_DIR, '.env')
load_dotenv(ENV_FILE)

# Server configuration (read from .env)
SERVER_URL = os.environ.get("SERVER_URL", "http://172.27.82.14").rstrip('/')
PI_API_KEY = os.environ.get("PI_API_KEY", "")

# Upload endpoint (appended to SERVER_URL)
UPLOAD_ENDPOINT = f"{SERVER_URL}/upload-image"

# Upload interval in seconds (default: 120 seconds = 2 minutes)
UPLOAD_INTERVAL = int(os.environ.get("UPLOAD_INTERVAL", "120"))

# ============================================================================
# Logging Configuration
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

# ============================================================================
# Camera Capture Functions
# ============================================================================

def capture_camera_image(camera_index: int) -> str | None:
    """
    Capture a single image from the specified camera.
    
    Args:
        camera_index: Camera index (0 or 1)
        
    Returns:
        Path to saved image file, or None if capture failed
    """
    try:
        logger.info(f"Initializing camera {camera_index}...")
        picam = Picamera2(camera_index)
        
        # Create still image configuration
        config = picam.create_still_configuration()
        picam.configure(config)
        picam.start()
        
        # Allow sensor to warm up
        time.sleep(1)
        
        # Generate timestamped filename (e.g., cam0_2025-03-16_14-32-00.jpg)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"cam{camera_index}_{timestamp}.jpg"
        filepath = os.path.join(SCRIPT_DIR, filename)
        
        # Capture image
        logger.info(f"Capturing image from camera {camera_index}...")
        picam.capture_file(filepath)
        
        picam.stop()
        picam.close()
        
        logger.info(f"Camera {camera_index} image saved: {filepath}")
        return filepath
        
    except Exception as e:
        logger.error(f"Failed to capture image from camera {camera_index}: {e}")
        return None


def capture_both_cameras() -> tuple[str | None, str | None]:
    """
    Capture images from both cameras simultaneously using threading.
    
    Returns:
        Tuple of (camera_0_path, camera_1_path), with None for any failed capture
    """
    results = {"cam0": None, "cam1": None}
    
    def capture_cam0():
        results["cam0"] = capture_camera_image(0)
    
    def capture_cam1():
        results["cam1"] = capture_camera_image(1)
    
    # Start threads for both cameras
    thread_0 = threading.Thread(target=capture_cam0, daemon=False)
    thread_1 = threading.Thread(target=capture_cam1, daemon=False)
    
    logger.info("Starting simultaneous capture from both cameras...")
    thread_0.start()
    thread_1.start()
    
    # Wait for both threads to complete
    thread_0.join()
    thread_1.join()
    
    logger.info("Both cameras finished capturing")
    return results["cam0"], results["cam1"]


# ============================================================================
# Upload Functions
# ============================================================================

def upload_single_image(image_path: str, camera_index: int) -> bool:
    """
    Upload a single image file to the backend server.
    Sends a separate POST request with multipart/form-data and 'image' field.
    
    Args:
        image_path: Path to the image file
        camera_index: Camera index (for logging purposes)
        
    Returns:
        True if upload successful, False otherwise
    """
    if not PI_API_KEY:
        logger.error("PI_API_KEY not configured in .env; cannot upload")
        return False
    
    if not os.path.exists(image_path):
        logger.error(f"Image file does not exist: {image_path}")
        return False
    
    try:
        logger.info(f"Uploading camera {camera_index} image to {UPLOAD_ENDPOINT}...")
        
        with open(image_path, 'rb') as f:
            files = {'image': f}
            headers = {'x-api-key': PI_API_KEY}
            
            response = requests.post(
                UPLOAD_ENDPOINT,
                files=files,
                headers=headers,
                timeout=30
            )
        
        if response.status_code == 200:
            logger.info(f"Camera {camera_index} upload successful: {response.json()}")
            return True
        else:
            logger.error(f"Camera {camera_index} upload failed with status {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error uploading camera {camera_index}: {e}")
        return False
    except requests.exceptions.Timeout as e:
        logger.error(f"Timeout uploading camera {camera_index}: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error uploading camera {camera_index}: {e}")
        return False


def upload_both_images(cam0_path: str | None, cam1_path: str | None) -> bool:
    """
    Upload both images via separate POST requests.
    Both requests are sent even if one fails (returns True only if both succeed).
    
    Args:
        cam0_path: Path to camera 0 image (or None if capture failed)
        cam1_path: Path to camera 1 image (or None if capture failed)
        
    Returns:
        True if both uploads successful, False if either failed or no images
    """
    if not cam0_path and not cam1_path:
        logger.warning("No images to upload")
        return False
    
    results = []
    
    if cam0_path:
        results.append(upload_single_image(cam0_path, 0))
    else:
        logger.warning("Camera 0 image not available for upload")
        results.append(False)
    
    if cam1_path:
        results.append(upload_single_image(cam1_path, 1))
    else:
        logger.warning("Camera 1 image not available for upload")
        results.append(False)
    
    return all(results)


def cleanup_local_file(filepath: str | None) -> None:
    """Remove local image file after successful upload."""
    if filepath and os.path.exists(filepath):
        try:
            os.remove(filepath)
            logger.debug(f"Cleaned up local file: {filepath}")
        except Exception as e:
            logger.warning(f"Failed to clean up file {filepath}: {e}")


# ============================================================================
# Main Loop
# ============================================================================

def main():
    """Main entry point: capture and upload images in a loop."""
    logger.info("="*70)
    logger.info("Starting Raspberry Pi Dual Camera Upload Service")
    logger.info("="*70)
    logger.info(f"Server URL: {SERVER_URL}")
    logger.info(f"Endpoint: {UPLOAD_ENDPOINT}")
    logger.info(f"Upload interval: {UPLOAD_INTERVAL} seconds")
    logger.info(f"API Key configured: {'Yes' if PI_API_KEY else 'No'}")
    logger.info("="*70)
    
    if not PI_API_KEY:
        logger.error("ERROR: PI_API_KEY is not set in .env file")
        logger.error(f"Please create {ENV_FILE} with PI_API_KEY and SERVER_URL variables")
        sys.exit(1)
    
    try:
        cycle_count = 0
        while True:
            cycle_count += 1
            logger.info(f"\n--- Cycle {cycle_count} ---")
            logger.info("Starting capture cycle...")
            
            # Capture from both cameras simultaneously
            cam0_path, cam1_path = capture_both_cameras()
            
            # Log capture results
            if cam0_path:
                logger.info(f"✓ Camera 0 captured: {os.path.basename(cam0_path)}")
            else:
                logger.warning("✗ Camera 0 capture failed")
            
            if cam1_path:
                logger.info(f"✓ Camera 1 captured: {os.path.basename(cam1_path)}")
            else:
                logger.warning("✗ Camera 1 capture failed")
            
            # Attempt to upload both images
            logger.info("Uploading captured images...")
            upload_success = upload_both_images(cam0_path, cam1_path)
            
            # Clean up local files after successful upload
            if upload_success:
                logger.info("Upload successful; cleaning up local files")
                cleanup_local_file(cam0_path)
                cleanup_local_file(cam1_path)
            else:
                logger.warning("Upload failed or incomplete; keeping local files")
            
            logger.info(f"Waiting {UPLOAD_INTERVAL} seconds before next cycle...")
            time.sleep(UPLOAD_INTERVAL)
            
    except KeyboardInterrupt:
        logger.info("\nService stopped by user (Ctrl+C)")
        sys.exit(0)
    except Exception as e:
        logger.critical(f"Unexpected error in main loop: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
