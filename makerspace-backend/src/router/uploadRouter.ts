/**
 * uploadRouter.tsx
 * Router that handles image uploads from raspberry pi and
 * spawns a python YOLO model to process the image.
 * Inference results are queued as pending updates for admin approval
 * rather than being written to the database immediately.
 *
 * @ai-assisted Claude Code (Anthropic) — https://claude.ai/claude-code
 * AI used for YOLO subprocess integration review, debugging, approval queue integration,
 * and null-camera cross-camera aggregation logic.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { getItemsByCameraId, getItemsWithNullCamera } from './itemRouter';
import { InventoryItem } from '../models/inventory_item';
dotenv.config();

const imageRouter = express.Router();

// Upload to this directory on prod server
const UPLOAD_DIR = '/var/www/ITAMS/data/images/';

// Check for .env
if (!process.env.PI_API_KEY) {
  throw new Error('Ensure PI_API_KEY is defined in .env');
}
if (!process.env.PYTHON_VENV_PATH) {
  throw new Error('Ensure PYTHON_VENV_PATH is defined in .env');
}
if (!process.env.PYTHON_SCRIPT_PATH) {
  throw new Error('Ensure PYTHON_SCRIPT_PATH is defined in .env');
}
// Rasperry Pi authorization
function authPi(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.header('x-api-key');
  const validKey = process.env.PI_API_KEY;

  if (!apiKey || apiKey !== validKey) {
    return res.status(401).json({ message: 'Unauthorized: Invalid Pi API Key' });
  }

  next();
}

// Rename image with timestamp prefix when writing to image folder
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `pi-upload-${uniquePrefix}${path.extname(file.originalname)}`);
  },
});

interface PendingImage {
  path: string;
  cameraIndex: number;
}

export interface PendingUpdate {
  id: string;
  itemID: number;
  itemName: string;
  cameraIndex: number | null;
  currentQuantity: number;
  proposedQuantity: number;
  timestamp: string;
  labelCounts: Record<string, number>;
}

export const pendingUpdates: PendingUpdate[] = [];

export function queueUpdate(
  item: InventoryItem,
  proposedQuantity: number,
  cameraIndex: number | null,
  labelCounts: Record<string, number>,
): void {
  const update: PendingUpdate = {
    id: randomUUID(),
    itemID: item.itemID,
    itemName: item.itemName,
    cameraIndex,
    currentQuantity: item.quantity,
    proposedQuantity,
    timestamp: new Date().toISOString(),
    labelCounts,
  };

  // Replace any existing pending update for this item so there is at most one per item
  const existingIdx = pendingUpdates.findIndex((u) => u.itemID === item.itemID);
  if (existingIdx !== -1) {
    pendingUpdates[existingIdx] = update;
  } else {
    pendingUpdates.push(update);
  }
}

const upload = multer({ storage: storage });
let pendingImages: PendingImage[] = []; // Two cameras. Track multiple pending images
let inferenceTimeout: NodeJS.Timeout | null = null; // Handle timeout due to not receiving two images
let isProcessing = false; // Used for blocking spawn of multiple inference scripts

const triggerInference = () => {
  if (pendingImages.length === 0 || isProcessing) return;

  // Clear timeout
  if (inferenceTimeout) {
    clearTimeout(inferenceTimeout);
    inferenceTimeout = null;
  }

  // Lock process and move pending images to the queue
  isProcessing = true;
  const imagesToProcess = [...pendingImages];
  pendingImages = [];

  console.log(`Executing YOLO on: ${imagesToProcess.map((img) => img.path).join(', ')}`);

  // Path to venv python executable and inference script
  const venvPython = process.env.PYTHON_VENV_PATH as string;
  const scriptPath = process.env.PYTHON_SCRIPT_PATH as string;

  // Spawn python process — pass image paths in order; output is a JSON array indexed the same way
  const pythonProcess = spawn(venvPython, [scriptPath, ...imagesToProcess.map((img) => img.path)]);

  // Pull data from stdout
  pythonProcess.stdout.on('data', async (data) => {
    try {
      const perImageCounts: Record<string, number>[] = JSON.parse(data.toString());

      // Per-camera items: queue updates for items assigned to a specific camera
      for (let i = 0; i < imagesToProcess.length; i++) {
        const { cameraIndex } = imagesToProcess[i];
        const labelCounts = perImageCounts[i] ?? {};
        const items = await getItemsByCameraId(cameraIndex);

        for (const item of items) {
          if (!item.yoloLabels?.length) continue;
          const newQuantity = item.yoloLabels.reduce(
            (sum, label) => sum + (labelCounts[label] ?? 0), 0
          );
          queueUpdate(item, newQuantity, cameraIndex, labelCounts);
          console.log(`Queued update for ${item.itemName} → ${newQuantity} (camera ${cameraIndex})`);
        }
      }

      // Null-camera items: sum counts across all cameras in this batch
      const combinedLabelCounts: Record<string, number> = {};
      for (const counts of perImageCounts) {
        for (const [label, count] of Object.entries(counts)) {
          combinedLabelCounts[label] = (combinedLabelCounts[label] ?? 0) + count;
        }
      }

      const nullCameraItems = await getItemsWithNullCamera();
      for (const item of nullCameraItems) {
        if (!item.yoloLabels?.length) continue;
        const newQuantity = item.yoloLabels.reduce(
          (sum, label) => sum + (combinedLabelCounts[label] ?? 0), 0
        );
        queueUpdate(item, newQuantity, null, combinedLabelCounts);
        console.log(`Queued update for null-camera item ${item.itemName} → ${newQuantity}`);
      }
    } catch (e) {
      console.error('Inference Output Error', data.toString());
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error('Python Error:', data.toString());
  });

  // Release lock when the process closes
  pythonProcess.on('close', () => {
    isProcessing = false;

    // Check if new image arrived while processing
    if (pendingImages.length > 0) triggerInference();
  });
};

imageRouter.post('/upload-image', authPi, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const camMatch = req.file.originalname.match(/^cam(\d+)_/);
  const cameraIndex = camMatch ? parseInt(camMatch[1], 10) : 0;
  pendingImages.push({ path: req.file.path, cameraIndex });

  // Start 30s timeout countdown when first image received
  if (pendingImages.length === 1) {
    inferenceTimeout = setTimeout(() => {
      console.log('Timer expired: processing partial batch');
      triggerInference();
    }, 30000);
  }

  // If expected image count, trigger immediately
  if (pendingImages.length >= 2) {
    triggerInference();
  }

  // Return OK status
  return res.status(200).json({
    message: 'Image queued for inference',
    file: req.file.filename,
  });
});

export default imageRouter;
