import { Message, MessageEmbed } from 'discord.js';
import config from '../config';
import { canManageMessages, isAdmin } from '../utils';
import CommandError from './CommandError';
import commands from './instances';
import * as parser from './parser';

export function onError(message: Message, title: string, tip?: string): void {
  const response = new MessageEmbed().setColor(config.visuals.red).setDescription(title);
  message.channel.send(tip ? response.setFooter(tip) : response);
}

export async function onMessageReceived(message: Message): Promise<void> {
  if (!parser.isValid(message)) {
    return;
  }

  const parsed = await parser.parse(message);

  commands.forEach(async c => {
    // If the message doesn't match the activation conditions
    if (!c.activated(parsed)) return;

    // If the message requires admin permissions and the
    // member who sent it is not an admin
    if (c.requiresAdmin && !isAdmin(message.member)) {
      return onError(
        message,
        'That command requires Admin permissions.',
        'Contact your server administrator for help.'
      );
    }

    // If the message requires pagination, the bot requires "Manage Messages"
    // permissions to do the pagination via emoji reactions behaviour
    if (c.requiresPagination && !canManageMessages(message.guild?.me)) {
      return onError(
        message,
        'That command requires the bot to have "Manage Messages" permissions.',
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
      message.channel.startTyping();
      // All conditions are met, execute the command
      await c.execute(parsed);
    } catch (e) {
      // If a command error was thrown during execution, handle the response here.
      if (e instanceof CommandError) {
        return onError(message, e.message, e.tip);
      }
    } finally {
      message.channel.stopTyping();
    }
  });
}
