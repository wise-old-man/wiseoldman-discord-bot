import { isErrored } from '@attio/fetchable';
import cors from 'cors';
import { Client } from 'discord.js';
import express from 'express';
import { onEventReceived } from './events/router';

const PORT = process.env.BOT_PORT || 7000;

export function init(client: Client) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/', (_req, res) => {
    res.json(true);
  });

  /**
   * The bot opens up port 7000 to receive http requests from the WOM API.
   * These requests contain events that the bot should attempt to propagate to relevant discord servers.
   */
  app.post('/event', async (req, res) => {
    const result = await onEventReceived(client, req.body);

    if (isErrored(result)) {
      switch (result.error.code) {
        case 'EVENT_TYPE_NOT_FOUND':
          return res.status(400).json(result.error);
        case 'FAILED_TO_EXECUTE_EVENT':
          // This shouldn't be propagated to the API. The API has done its job by sending the event to the bot.
          // If we were to propagate this error, the API would just retry sending the event, which would likely fail again.
          break;
      }
    }

    return res.json('Event received.');
  });

  return app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
