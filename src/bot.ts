import { Client } from 'discord.js';
import * as router from './commands/router';
import config from './config';

class Bot {
  client: Client;

  constructor() {
    this.client = new Client();
  }

  init() {
    this.client.once('ready', () => {
      // Init bot properties
      this.client.user?.setActivity('bot.wiseoldman.net');

      // Send received messages to the command router
      this.client.on('message', router.onMessageReceived);

      console.log('Bot is running.');
    });

    this.client.login(config.token);
  }
}

export default new Bot();
