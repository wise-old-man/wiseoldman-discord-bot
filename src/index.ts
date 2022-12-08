import * as api from './api';
import bot from './bot';
import { deployCommands } from './deploy-commands';

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
