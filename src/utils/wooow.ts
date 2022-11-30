import { CommandInteraction } from 'discord.js';
import { getServer, getUsername } from '../services/prisma';
import { CommandError, ErrorCode } from './error';

export async function getUsernameParam(interaction: CommandInteraction) {
  const username = interaction.options.getString('username', false);
  if (username) return username;

  const inferredUsername = await getUsername(interaction.user.id);

  if (!inferredUsername) {
    throw new CommandError(
      ErrorCode.PLAYER_NOT_FOUND,
      'This commands requires a username. Specify one in the command, or set a default by using the `/setrsn` command.'
    );
  }

  return inferredUsername;
}

export async function getLinkedGroupId(interaction: CommandInteraction) {
  if (!interaction.inGuild()) {
    throw new CommandError(ErrorCode.NOT_IN_GUILD);
  }

  const guildId = interaction.guildId;

  if (!guildId) {
    throw new CommandError(ErrorCode.UNDEFINED_GUILD_ID);
  }

  const server = await getServer(guildId);
  const groupId = server?.groupId || -1;

  if (groupId === -1) {
    throw new CommandError(
      ErrorCode.UNDEFINED_GROUP_ID,
      'There is no group configured for this Discord server.',
      'Start the group setup with the "/config group" command.'
    );
  }

  return groupId;
}

export function keyValue(key: string, value: string | number) {
  return `**${key}:** ${value}`;
}

export function bold(str: string | number) {
  return `**${str}**`;
}
