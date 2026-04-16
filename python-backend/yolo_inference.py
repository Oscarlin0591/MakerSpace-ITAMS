"""
yolo_inference.py
Python script spawned as child process by Node backend uploadRouter.ts
Handles YOLO inference on passed image routes
"""

import sys
import os
import json
from PIL import Image, ImageOps
from ultralytics import YOLO

# Ensure image is RGB and properly rotated. YOLO handles resize.
def preprocess_image(path: str) -> Image.Image:
        img = Image.open(path)
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        return img


def run_inference(image_paths):
        # Absolute paths
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, "models", "best.pt")
        # Check that model exists
        if not os.path.exists(model_path):
                print(f"Error: Model not found at {model_path}")
                sys.exit(1)

        # Absolute image paths
        abs_image_paths = [os.path.abspath(p) for p in image_paths]
        # Check if images exist
        for path in abs_image_paths:
                if (not os.path.exists(path)):
                        print(f"Error: Image not found at {path}")
                        sys.exit(1)

        per_image_counts: list[dict] = []
        try:
                model = YOLO(model_path, task='detect')
                preprocessed = [preprocess_image(p) for p in abs_image_paths]
                results = model(preprocessed, verbose=False)

                for res in results:
                        counts: dict[str, int] = {}
                        for box in res.boxes:
                                class_id = int(box.cls[0])
                                label = model.names[class_id]
                                counts[label] = counts.get(label, 0) + 1
                        per_image_counts.append(counts)

                # print JSON array — one dict per input image, in input order
                print(json.dumps(per_image_counts))

        except Exception as e:
                sys.stderr.write(f"Inference error: {e}\n")
                print(json.dumps(per_image_counts))
    
    

if __name__ == "__main__":
       # Paths passed as args
       if len(sys.argv) < 2:
                print("Error: No image paths passed to python script.")
                sys.exit(1)

       run_inference(sys.argv[1:])