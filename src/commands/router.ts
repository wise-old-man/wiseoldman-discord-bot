import { Message, MessageEmbed } from 'discord.js';
import config from '../config';
import { isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import * as parser from './parser';

export function onMessageReceived(message: Message) {
  // The message received is not valid
  if (!parser.isValid(message)) {
    return;
  }

  const parsed = parser.parse(message);

  // Loop through all the commands, if any of them are activated, execute them
  commands.forEach(async c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(parsed)) {
      return;
    }

    if (c.requiresAdmin && !isAdmin(message.member)) {
      const response = new MessageEmbed()
        .setColor(config.visuals.red)
        .setDescription('That command requires Admin permissions.')
        .setFooter('Contact your server administrator for help.');

      return message.channel.send(response);
    }

    try {
      // All conditions are met, execute the command
      await c.execute(parsed);
    } catch (e) {
      // If a command error was thrown during execution, handle the response here.
      if (e instanceof CommandError) {
        const response = new MessageEmbed().setColor(config.visuals.red).setDescription(e.message);
        message.channel.send(e.tip ? response.setFooter(e.tip) : response);
      }
    }
  });
}
