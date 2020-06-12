import { Message } from 'discord.js';
import { isAdmin } from '../utils';
import commands from './instances';
import * as parser from './parser';

export function onMessageReceived(message: Message) {
  // The message received is not valid
  if (!parser.isValid(message)) {
    return;
  }

  const parsed = parser.parse(message);

  // Loop through all the commands, if any of them are activated, execute them
  commands.forEach(c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(parsed)) {
      return;
    }

    if (c.requiresAdmin && !isAdmin(message.member)) {
      message.channel.send('That command requires Admin permissions.');
    } else {
      c.execute(parsed);
    }
  });
}
