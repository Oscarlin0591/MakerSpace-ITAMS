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
 *
 * @ai-assisted Codex (OpenAI) — https://openai.com/codex
 * AI used for Jest testability refactor and Python subprocess mock coverage.
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
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

export interface PendingImage {
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

type InventoryLookup = {
  getItemsByCameraId: (cameraId: number) => Promise<InventoryItem[]>;
  getItemsWithNullCamera: () => Promise<InventoryItem[]>;
};

export function getProposedQuantity(
  item: InventoryItem,
  labelCounts: Record<string, number>,
): number {
  return (item.yoloLabels ?? []).reduce((sum, label) => sum + (labelCounts[label] ?? 0), 0);
}

export function mergeLabelCounts(perImageCounts: Record<string, number>[]): Record<string, number> {
  const combinedLabelCounts: Record<string, number> = {};
  for (const counts of perImageCounts) {
    for (const [label, count] of Object.entries(counts)) {
      combinedLabelCounts[label] = (combinedLabelCounts[label] ?? 0) + count;
    }
  }
  return combinedLabelCounts;
}

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

export async function applyInferenceResults(
  imagesToProcess: PendingImage[],
  perImageCounts: Record<string, number>[],
  lookup: InventoryLookup = { getItemsByCameraId, getItemsWithNullCamera },
): Promise<void> {
  for (let i = 0; i < imagesToProcess.length; i++) {
    const { cameraIndex } = imagesToProcess[i];
    const labelCounts = perImageCounts[i] ?? {};
    const items = await lookup.getItemsByCameraId(cameraIndex);

    for (const item of items) {
      if (!item.yoloLabels?.length) continue;
      const newQuantity = getProposedQuantity(item, labelCounts);
      queueUpdate(item, newQuantity, cameraIndex, labelCounts);
      console.log(`Queued update for ${item.itemName} -> ${newQuantity} (camera ${cameraIndex})`);
    }
  }

  const combinedLabelCounts = mergeLabelCounts(perImageCounts);
  const nullCameraItems = await lookup.getItemsWithNullCamera();

  for (const item of nullCameraItems) {
    if (!item.yoloLabels?.length) continue;
    const newQuantity = getProposedQuantity(item, combinedLabelCounts);
    queueUpdate(item, newQuantity, null, combinedLabelCounts);
    console.log(`Queued update for null-camera item ${item.itemName} -> ${newQuantity}`);
  }
}

export function runPythonInference(
  imagesToProcess: PendingImage[],
  spawnImpl: typeof spawn = spawn,
): Promise<Record<string, number>[]> {
  const venvPython = process.env.PYTHON_VENV_PATH as string;
  const scriptPath = process.env.PYTHON_SCRIPT_PATH as string;
  const pythonProcess = spawnImpl(
    venvPython,
    [scriptPath, ...imagesToProcess.map((img) => img.path)],
  ) as ChildProcessWithoutNullStreams;

  let stdout = '';
  return new Promise((resolve, reject) => {
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python Error:', data.toString());
    });

    pythonProcess.on('error', reject);
    pythonProcess.on('close', (code) => {
      if (code && code !== 0) {
        reject(new Error(`Python inference exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch {
        console.error('Inference Output Error', stdout);
        reject(new Error('Invalid inference output'));
      }
    });
  });
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

  runPythonInference(imagesToProcess)
    .then((perImageCounts) => applyInferenceResults(imagesToProcess, perImageCounts))
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
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

