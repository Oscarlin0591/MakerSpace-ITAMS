import express, {type Request, type Response} from "express";
import cors from "cors";
// import fs from 'fs';

const app = express();
const port = 3000;

const main = async () => {
  await initializeServer();
}

const initializeServer = async () => {

  app.use(
    cors({
      origin: ["*"]
    })
  );

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello from TS Express!');
  });

  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  })
}

main();