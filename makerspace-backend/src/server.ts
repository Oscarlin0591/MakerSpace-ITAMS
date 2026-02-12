import express, { type Request, type Response, type Router } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { getItem, postItem } from './router/itemRouter';
import fs from 'fs';
import { authenticateUser, getUser } from './router/userRouter';
import { getEmail } from './router/emailRouter';
import { getCategory } from './router/categoryRouter';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

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
const port = 3000;
const secretKey = '79rX6Ac$52Da';

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_PUBLISHABLE_KEY);

const main = async () => {
  await initializeServer();
};

function authorizeUser(req: Request, res: Response, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    jwt.verify(token, secretKey);
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
}

function authorizeAdmin(req: Request, res: Response, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    req.user = jwt.verify(token, secretKey);
    console.log(req.user.isAdmin);
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

  apiRouter.post('/authenticate', (req: Request, res: Response) => {
    try {
      authenticateUser(req.body.username, req.body.password).then((result) => {
        if (result) {
          getUser(req.body.username).then((user) => {
            const token = jwt.sign(
              { username: req.body.username, isAdmin: user.data.is_admin },
              secretKey,
              { expiresIn: '24h' },
            );
            return res.status(200).send(token);
          });
        } else {
          res.status(401).send(false);
        }
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/authorized', authorizeUser, (_req: Request, res: Response) => {
    return res.status(200);
  });

  apiRouter.get('/authorized-admin', authorizeAdmin, (_req: Request, res: Response) => {
    return res.status(200);
  });

  apiRouter.get('/items', authorizeUser, (_req: Request, res: Response) => {
    try {
      getItem().then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/items/:id', authorizeUser, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      getItem(id).then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.post('/items', authorizeAdmin, (req: Request, res: Response) => {
    try {
      const item = req.body.newItem;
      postItem(item);
      return res.status(200);
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // user routes

  apiRouter.get('/users', authorizeUser, (_req: Request, res: Response) => {
    try {
      getUser().then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/users/:id', authorizeUser, (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      getUser(id).then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // notification routes

  apiRouter.get('/notifications', authorizeUser, (_req: Request, res: Response) => {
    try {
      getEmail().then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  // =============================================================================================================================
  // category routes

  apiRouter.get('/category', authorizeUser, (_req: Request, res: Response) => {
    try {
      getCategory().then((result) => {
        return res.status(200).send(result.data);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Unexpected backend error' });
    }
  });

  apiRouter.get('/category/:id', authorizeUser, (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      getCategory(id).then((result) => {
        return res.status(200).send(result.data);
      });
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
