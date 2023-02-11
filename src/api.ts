import cors from 'cors';
import { Client } from 'discord.js';
import express from 'express';
import env from './env';
import { onEventReceived } from './events/router';
import monitoring from './utils/monitoring';

const PORT = 7000;

export function init(client: Client) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/', (req, res) => {
    res.json(true);
  });

  /**
   * The bot opens up port 7000 to receive http requests from the WOM API.
   * These requests contain events that the bot should attempt to propagate (brodcast) to relevant discord servers.
   */
  app.post('/event', (req, res) => {
    const token = req.body['api_token'];

    if (!token || token !== env.DISCORD_BOT_API_TOKEN) {
      return res.status(401).json({ message: 'Wrong API Token.' });
    }

    console.log('Event received: ', req.body);

    onEventReceived(client, req.body);
    return res.json('Event received.');
  });

  app.get('/monitoring', async (req, res) => {
    const metrics = await monitoring.getMetrics();
    res.json(metrics);
  });

  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
