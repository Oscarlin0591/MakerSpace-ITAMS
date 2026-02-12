from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import io
from PIL import Image

app = FastAPI()

# Load nano model on startup
model = YOLO("yolov8n.pt") 

@app.get("/")
def read_root():
    return {"status": "YOLO API is running"}

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    # Read image from the request
    request_object_content = await file.read()
    img = Image.open(io.BytesIO(request_object_content))

    # Run Inference
    results = model(img)

    # Parse results (getting class names and counts)
    detections = []
    for r in results:
        for c in r.boxes.cls:
            detections.append(model.names[int(c)])

    # Simple count of detected objects
    counts = {name: detections.count(name) for name in set(detections)}

    return {"detections": counts}