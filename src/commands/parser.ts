import { Message, StringResolvable } from 'discord.js';
import config from '../config';
import { ParsedMessage } from '../types';

export function parse(message: Message): ParsedMessage {
  // Remove the prefix from the command text
  const commandBody = message.content.replace(config.prefix, '');

  // Split the command into its different sections
  const split = commandBody.split(' ').filter(s => s.length);

  if (split.length === 0) {
    throw new Error('Empty command.');
  }

  const source = message;
  const command = split[0];
  const prefix = config.prefix;
  const args = split.slice(1, split.length);

  const respond = (response: StringResolvable | StringResolvable[]) => {
    if (Array.isArray(response)) {
      response.forEach(r => message.channel.send(r));
    } else {
      message.channel.send(response);
    }
  };

  return { source, prefix, command, args, respond };
}

export function isValid(message: Message): boolean {
  // Must be defined and not empty
  if (!message || !message.content || !message.content.length) {
    return false;
  }

  // Must start with the prefix
  if (!message.content.startsWith(config.prefix)) {
    return false;
  }

  // The message can't just be the prefix and nothing else
  return message.content.length > config.prefix.length;
}
