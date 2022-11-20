import cors from 'cors';
import express, { Express } from 'express';
import { onEventReceived } from '../events/router';

const PORT = 7000;

export function init(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/', (req, res) => {
    res.json(true);
  });

  app.post('/event', (req, res) => {
    const token = req.body['api_token'];

    if (!token || token !== process.env.DISCORD_BOT_API_TOKEN) {
      return res.status(401).json({ message: 'Wrong API Token.' });
    }

    console.log('Event received: ', req.body);

    onEventReceived(req.body);
    return res.json('Event received.');
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  return app;
}
