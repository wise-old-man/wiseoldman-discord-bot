import * as api from './api';
import bot from './bot';
import { deployCommands } from './deploy-commands';

(async function () {
  await deployCommands();

  bot.init();
  const server = api.init();

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
