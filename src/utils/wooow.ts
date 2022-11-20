import { CommandInteraction } from 'discord.js';
import { getServer } from '../services/prisma';
import { CommandErrorAlt, ErrorCode } from './error';

export async function getLinkedGroupId(interaction: CommandInteraction) {
  if (!interaction.inGuild()) {
    throw new CommandErrorAlt(ErrorCode.NOT_IN_GUILD);
  }

  const guildId = interaction.guildId;

  if (!guildId) {
    throw new CommandErrorAlt(ErrorCode.UNDEFINED_GUILD_ID);
  }

  const server = await getServer(guildId);
  const groupId = server?.groupId || -1;

  if (groupId === -1) {
    throw new CommandErrorAlt(
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
