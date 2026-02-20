import express, { type NextFunction, type Request, type Response, type Router } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { getItem, postItem } from './router/itemRouter';
import fs from 'fs';
import { authenticateUser, getUser } from './router/userRouter';
import { getEmail } from './router/emailRouter';
import { getCategory, postCategory } from './router/categoryRouter';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { type JwtUserPayload } from './types/express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import imageRouter from './router/uploadRouter';
dotenv.config();

// Extend express request to include nullable user type
declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if config file exists. If not end the process.
const configPath = path.resolve(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('Please added the config.json file to backend src directory.');
  process.exit(1);
}

const app = express();
const apiRouter: Router = express.Router();
apiRouter.use(imageRouter);

// Check for .env file
if (!process.env.PORT || !process.env.JWT_SECRET) {
  throw new Error('Ensure PORT and JWT_SECRET are defined in .env');
}
const port = process.env.PORT;
const jwtSecret = process.env.JWT_SECRET;

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

const main = async () => {
  await initializeServer();
};

function authorizeUser(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtUserPayload;
    req.user = decoded;
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Administrator access denied.' });
    }
  } catch (err) {
    console.log('Token was blocked');
    res.status(400).json({ message: 'Invalid token' });
  }
}

const initializeServer = async () => {
  app.use(
    cors({
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://172.27.82.14'],
    }),
  );
  app.use(bodyParser.json());

  // =============================================================================================================================
  // item routes

  apiRouter.post('/authenticate', async (req: Request, res: Response) => {
    try {
      const isValid = await authenticateUser(req.body.username, req.body.password);

      if (!isValid) {
        return res.status(401).json({ message: 'Invalid Credentials' });
      }

      const user = await getUser(req.body.username);
      const token = jwt.sign(
        {
          username: user.data.username,
          isAdmin: user.data.is_admin,
        },
        jwtSecret,
        { expiresIn: '24h' },
      );

      return res.status(200).json({ token: token, isAdmin: user.data.is_admin });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/authorized', authorizeUser, async (_req: Request, res: Response) => {
    return res.status(200).send(true);
  });

  apiRouter.get('/authorized-admin', authorizeAdmin, async (_req: Request, res: Response) => {
    return res.status(200).send(true);
  });

  apiRouter.get('/items', authorizeUser, async (_req: Request, res: Response) => {
    try {
      const result = await getItem();
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/items/:id', authorizeUser, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await getItem(id);
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.post('/items', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const item = req.body.newItem;

      const createdItem = await postItem(item);

      return res.status(200).json(createdItem);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // user routes

  apiRouter.get('/users', authorizeUser, async (_req: Request, res: Response) => {
    try {
      const result = await getUser();
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/users/:id', authorizeUser, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await getUser(id);
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // notification routes

  apiRouter.get('/notifications', authorizeUser, async (_req: Request, res: Response) => {
    try {
      const result = await getEmail();
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // category routes

  apiRouter.get('/category', authorizeUser, async (_req: Request, res: Response) => {
    try {
      const result = await getCategory();
      return res.status(200).send(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/category/:id', authorizeUser, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await getCategory(id);
      return res.status(200).json(result.data);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.post('/category', authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const category = req.body.newCategory;
      await postCategory(category);
      return res.status(200);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // app.get("/notifications/:email", (req: Request, res: Response) => {
  //   try {
  //     const email = new URLSearchParams(req.params).get()
  //     const user = getEmail(email).then((result) => {
  //       return res.status(200).send(result.data);
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ error: "Unexpected backend error" });
  //   }
  // });

  // Mount API router at /api path
  app.use('/api', apiRouter);

  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
};

main();
