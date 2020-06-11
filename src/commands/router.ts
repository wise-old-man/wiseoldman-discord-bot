import { Message } from 'discord.js';
import config from '../config';
import { isAdmin } from '../utils';
import commands from './instances';

export function onMessage(message: Message) {
  // All bot commands should start with the predetermined prefix (! for now)
  if (!message.content.startsWith(config.prefix)) {
    return;
  }

  // Loop through all the commands, if any of them are activated, execute them
  commands.forEach(c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(message)) {
      return;
    }

    if (c.requiresAdmin && !isAdmin(message.member)) {
      message.channel.send('That command requires Admin permissions.');
    } else {
      c.execute(message);
    }
  });
}
