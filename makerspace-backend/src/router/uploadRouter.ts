/**
 * uploadRouter.tsx
 * Router that handles image uploads from raspberry pi and
 * spawns a python YOLO model to process the image
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
dotenv.config();

const imageRouter = express.Router();

// Upload to this directory on prod server
const UPLOAD_DIR = '/var/www/ITAMS/data/images/';

// Check for .env
if (!process.env.PI_API_KEY) {
  throw new Error('Ensure PI_API_KEY is defined in .env');
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

const upload = multer({ storage: storage });

imageRouter.post('/upload-image', authPi, upload.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  const imagePath = req.file.path;
  console.log(`Image saved: ${imagePath}`);

  // Spawn python
  const pythonProcess = spawn('python3', [
    '/var/www/ITAMS/backend-python/yolo_inference.py',
    imagePath,
  ]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`YOLO Output: ${data.toString()}`);
    // TODO: parse output and update supabase
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`YOLO Error: ${data.toString()}`);
  });

  // Return OK status
  return res.status(200).json({
    message: 'Image received, processing in background',
    file: req.file.filename,
  });
});

export default imageRouter;
