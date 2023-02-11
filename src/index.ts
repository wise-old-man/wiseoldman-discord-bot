import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import * as api from './api';
import bot from './bot';
import { deployCommands } from './deploy-commands';

Sentry.init({
  dsn: process.env.BOT_SENTRY_DSN,
  tracesSampleRate: 0.01
});

(async function () {
  await deployCommands();

  const client = await bot.init();
  const server = api.init(client);

  process.on('SIGTERM', () => {
    server.close();
  });

  process.on('SIGINT', () => {
    server.close();
  });

  process.on('exit', () => {
    server.close();
  });
})();
