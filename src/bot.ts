import { Client } from 'discord.js';
import * as router from './commands/router';

export function init(client: Client) {
  // Init bot properties
  client.user?.setActivity('wiseoldman.net', { type: 'PLAYING' });

  // Send received messages to the command router
  client.on('message', router.onMessageReceived);
}
