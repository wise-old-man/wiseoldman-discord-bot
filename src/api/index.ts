import cors from 'cors';
import express, { Express } from 'express';
import { onEventReceived } from '../events/router';

const PORT = process.env.PORT || 5000;

export function init(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/', (req, res) => {
    res.json(true);
  });

  app.post('/event', (req, res) => {
    onEventReceived(req.body);
    res.json('Yep.');
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  return app;
}
