import * as api from './api';
import bot from './bot';
import { deployCommands } from './deploy-commands';

(async function () {
  await deployCommands();

  bot.init();
  api.init();
})();
