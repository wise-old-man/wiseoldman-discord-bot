import { Client, Intents } from 'discord.js';
import * as router from './commands/router';
import config from './config';

class Bot {
  client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
      ],
      shards: 'auto'
    });
  }

  init() {
    this.client.once('ready', () => {
      // Init bot properties
      this.client.user?.setActivity('bot.wiseoldman.net');

      // Send received messages to the command router
      this.client.on('messageCreate', router.onMessageReceived);

      console.log('Bot is running.');
    });

    this.client.login(config.token);
  }
}

export default new Bot();
