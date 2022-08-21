import { Message, MessageOptions } from 'discord.js';
import config from '../config';
import { getServer } from '../database/services/server';
import { ParsedMessage } from '../types';

/**
 * Convert a Discord Message object into our own
 * ParsedMessage object, which should be simpler to use.
 */
export async function parse(message: Message): Promise<ParsedMessage> {
  // iOS apparently uses a special characters, so we should swap them
  message.content = message.content.replace(/—/g, '--').replace(/’/g, "'");

  const sourceMessage = message;

  const originServer = (await getServer(message.guild?.id)) || undefined;
  const prefix = originServer?.prefix || config.defaultPrefix;

  // Remove the prefix from the command text
  const commandBody = message.content.replace(prefix, '');

  // Split the command into its different sections
  const split = commandBody.split(' ').filter(s => s.length);

  if (split.length === 0) {
    throw new Error('Empty command.');
  }

  const command = split[0].toLowerCase();
  const args = split.slice(1, split.length);

  const respond = (response: MessageOptions | MessageOptions[]) => {
    if (Array.isArray(response)) {
      response.forEach(r => message.channel.send(r));
    } else {
      message.channel.send(response);
    }
  };

  const warningMessage = `⚠️ **Attention!** ⚠️
From *September 1st* and forward this bot will **only** support slash commands.

- Slash commands are integrated into Discord and we are **required** to use them.
- Slash commands should be easier to use as you can use auto completion to quickly select options.
- Try this command with \`/${command}\`.

You might need to update the bot's permissions. The easiest way to do this is to kick and re-invite the bot. You can do that by either:

- Clicking the bot's name on Discord's right-side panel, and then clicking the "Add to Server" button.
- Going to https://bot.wiseoldman.net/ and clicking the "Add to Discord" button.

You can read more about this decision at <https://bit.ly/3AD4zsM>`;
  respond({ content: warningMessage });

  return { sourceMessage, originServer, prefix, command, args, respond };
}

/**
 * Check if a message is a valid command.
 * Note: this doesn't check if the command exists.
 */
export function isValid(message: Message): boolean {
  // Must be defined and not empty
  if (!message || !message.content || !message.content.length) {
    return false;
  }

  // If doesn't start with any of the valid prefixes or isn't the help command
  if (
    !message.content.startsWith(config.helpCommand) &&
    !config.validPrefixes.find(p => message.content.startsWith(p))
  ) {
    return false;
  }

  return true;
}
