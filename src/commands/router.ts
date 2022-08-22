import { Message, MessageEmbed } from 'discord.js';
import config from '../config';
import { getMissingPermissions, isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import * as parser from './parser';
import { customCommands } from './CustomCommands';
import { CustomCommand } from '../types';

export function onError(message: Message, title: string, tip?: string): void {
  const response = new MessageEmbed().setColor(config.visuals.red).setDescription(title);
  message.channel.send({ embeds: [tip ? response.setFooter({ text: tip }) : response] });
}

export async function onMessageReceived(message: Message): Promise<void> {
  if (!parser.isValid(message)) {
    return;
  }

  const parsed = await parser.parse(message);
  const missingPermissions = getMissingPermissions(message.guild?.me);

  if (missingPermissions && missingPermissions.length > 0) {
    return onError(
      message,
      `Error! Missing permissions: \n\n${missingPermissions.map(m => `\`${m}\``).join('\n')}`,
      'Contact your server administrator for help.'
    );
  }

  // Check for custom commands
  customCommands.forEach((c: CustomCommand) => {
    if (
      c.command === parsed.command &&
      (c.public || parsed.sourceMessage?.guild?.id === config.discord.guildId)
    ) {
      parsed.respond({ content: c.image === undefined ? c.message : c.message + '\n' + c.image });
    }
  });

  commands.forEach(async c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(parsed)) return;

    const warningMessage = `⚠️ **Attention!** ⚠️
From *September 1st* and forward this bot will **only** support slash commands.

- Slash commands are integrated into Discord and we are **required** to use them.
- Slash commands should be easier to use as you can use auto completion to quickly select options.
- Try this command with \`/${
      ['womhelp', 'wom!help'].find(e => parsed.command === e) ? 'help' : parsed.command
    }\`.

You might need to update the bot's permissions. The easiest way to do this is to re-invite the bot. You can do that by either:

- Clicking the bot's name on Discord's right-side panel, and then clicking the "Add to Server" button.
- Going to https://bot.wiseoldman.net/ and clicking the "Add to Discord" button.

You can read more about this decision at <https://bit.ly/3AD4zsM>`;
    parsed.respond({ content: warningMessage });
    // If the message requires admin permissions and the
    // member who sent it is not an admin
    if (c.requiresAdmin && !isAdmin(message.member)) {
      return onError(
        message,
        'That command requires Admin permissions.',
        'Contact your server administrator for help.'
      );
    }

    // If the message requires a group to be setup, and no group is defined
    // for the message's origin server
    if (c.requiresGroup && !(parsed.originServer && parsed.originServer.groupId)) {
      return onError(
        message,
        'That command requires a group to be configured.',
        `Start the group setup with ${parsed.prefix}config group *groupId*`
      );
    }

    try {
      // Display bot is typing... indicator.
      message.channel.sendTyping();
      // All conditions are met, execute the command
      await c.execute(parsed);
    } catch (e) {
      // If a command error was thrown during execution, handle the response here.
      if (e instanceof CommandError) {
        return onError(message, e.message, e.tip);
      }
    }
  });
}
