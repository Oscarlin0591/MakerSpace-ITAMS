/**
 * Yolo.tsx
 * Object detection page using YOLOv7 TensorFlow.js model
 * Detects objects in real-time using the device webcam
 */

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Button, Card, Container, ProgressBar } from "react-bootstrap";

type ModelState = {
  net: tf.GraphModel;
  inputShape: number[];
};

const COCO_CLASSES = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train",
  "truck", "boat", "traffic light", "fire hydrant", "stop sign",
  "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
  "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag",
  "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball", "kite",
  "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
  "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana",
  "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza",
  "donut", "cake", "chair", "couch", "potted plant", "bed", "dining table",
  "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
  "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock",
  "vase", "scissors", "teddy bear", "hair drier", "toothbrush",
];

const CONF_THRESHOLD = 0.5;
const IOU_THRESHOLD  = 0.45;
const MAX_DETECTIONS = 100;

export function Yolo() {
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState<ModelState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // Load model on mount
  useEffect(() => {
    tf.ready().then(async () => {
      const yolov7 = await tf.loadGraphModel(`/yolov7_tfjs/model.json`, {
        onProgress: (fractions) => {
          setLoading({ loading: true, progress: fractions });
        },
      });

      if (!yolov7) return;

      // Warm up — use execute() since model has no control flow
      const dummyInput = tf.ones(yolov7.inputs[0].shape!);
      const warmupResult = yolov7.execute(dummyInput);
      tf.dispose([dummyInput, warmupResult]);

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov7,
        inputShape: yolov7.inputs[0].shape ?? [1, 640, 640, 3],
      });
    });
  }, []);

  // Cancel animation frame on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);


  function detectFrame(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    net: tf.GraphModel,
    inputShape: number[]
  ) {
    if (video.paused || video.ended) return;

    const modelH = inputShape[1] ?? 640;
    const modelW = inputShape[2] ?? 640;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Run inference + synchronous NMS — everything in one rAF callback
    // so the browser paints video + boxes together
    tf.tidy(() => {
      const frame      = tf.browser.fromPixels(video);
      const resized    = tf.image.resizeBilinear(frame, [modelH, modelW]);
      const normalized = resized.div(255.0).expandDims(0);
      const pred       = (net.execute(normalized) as tf.Tensor).squeeze([0]);

      const cx = pred.slice([0, 0], [-1, 1]);
      const cy = pred.slice([0, 1], [-1, 1]);
      const bw = pred.slice([0, 2], [-1, 1]);
      const bh = pred.slice([0, 3], [-1, 1]);
      const boxes = tf.concat([
        cy.sub(bh.div(2)).div(modelH), // y1
        cx.sub(bw.div(2)).div(modelW), // x1
        cy.add(bh.div(2)).div(modelH), // y2
        cx.add(bw.div(2)).div(modelW), // x2
      ], 1) as tf.Tensor2D;

      const obj         = pred.slice([0, 4], [-1, 1]).sigmoid();
      const classScores = pred.slice([0, 5], [-1, 80]).sigmoid();
      const allScores   = obj.mul(classScores);
      const scores      = allScores.max(1) as tf.Tensor1D;
      const classIds    = allScores.argMax(1) as tf.Tensor1D;

      // Synchronous NMS — no await, no yield, no missed paint
      const selectedIdx = tf.image.nonMaxSuppression(
        boxes, scores, MAX_DETECTIONS, IOU_THRESHOLD, CONF_THRESHOLD
      );

      const idxData   = selectedIdx.dataSync();
      const boxData   = boxes.dataSync();
      const scoreData = scores.dataSync();
      const classData = classIds.dataSync();

      drawBoxes(ctx, canvas.width, canvas.height, Array.from(idxData), boxData, scoreData, classData);
    });

    animFrameRef.current = requestAnimationFrame(() =>
      detectFrame(video, canvas, net, inputShape)
    );
  }

  function drawBoxes(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    indices: number[],
    boxes: tf.TypedArray,
    scores: tf.TypedArray,
    classes: tf.TypedArray
  ) {
    for (const i of indices) {
      const y1 = boxes[i * 4]     * h;
      const x1 = boxes[i * 4 + 1] * w;
      const y2 = boxes[i * 4 + 2] * h;
      const x2 = boxes[i * 4 + 3] * w;

      const score   = scores[i];
      const classId = classes[i];
      const label   = `${COCO_CLASSES[classId] ?? classId} ${(score * 100).toFixed(0)}%`;

      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth   = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      ctx.font = "bold 13px sans-serif";
      const textW = ctx.measureText(label).width;
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(x1, y1 - 20, textW + 6, 20);
      ctx.fillStyle = "#000";
      ctx.fillText(label, x1 + 3, y1 - 5);
    }
  }

  async function startCamera() {
    if (!videoRef.current || !model) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    setStreaming(true);

    videoRef.current.onloadeddata = () => {
      if (videoRef.current && canvasRef.current) {
        detectFrame(videoRef.current, canvasRef.current, model.net, model.inputShape);
      }
    };
  }

  function stopCamera() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (!videoRef.current?.srcObject) return;
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach((t) => t.stop());
    videoRef.current.srcObject = null;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setStreaming(false);
  }

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "70vh" }}
    >
      <Card
        className="p-4 shadow-lg text-center mt-5 border-2"
        style={{ maxWidth: "640px", width: "100%" }}
      >
        <h4 className="mb-3" style={{ color: "var(--brand-deep)" }}>
          Object Detection
        </h4>

        {loading.loading ? (
          <div className="my-3">
            <p className="mb-2 text-muted">Loading model...</p>
            <ProgressBar
              now={Math.round(loading.progress * 100)}
              label={`${Math.round(loading.progress * 100)}%`}
              animated
            />
          </div>
        ) : (
          <>
            {/* Hidden video — feeds frames into the canvas */}
            <video ref={videoRef} style={{ display: "none" }} muted />

            {/* Canvas is the visible display element */}
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                borderRadius: "8px",
                display: streaming ? "block" : "none",
              }}
            />

            {!streaming && (
              <p className="text-muted mb-3">
                Model ready. Start the camera to begin detection.
              </p>
            )}

            <Button
              variant={streaming ? "danger" : "primary"}
              className="w-100"
              onClick={streaming ? stopCamera : startCamera}
              disabled={!model}
            >
              {streaming ? "Stop Camera" : "Start Camera"}
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}

export default Yolo;
