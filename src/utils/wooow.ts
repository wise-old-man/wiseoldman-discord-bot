import { getServer } from '../services/prisma';
import { CommandErrorAlt, ErrorCode } from './error';

export async function getLinkedGroupId(guildId: string) {
  if (!guildId) {
    throw new CommandErrorAlt(ErrorCode.UNDEFINED_GUILD_ID);
  }

  const server = await getServer(guildId);
  const groupId = server?.groupId || -1;

  if (groupId === -1) {
    throw new CommandErrorAlt(ErrorCode.UNDEFINED_GROUP_ID);
  }

  return groupId;
}

export function keyValue(key: string, value: string | number) {
  return `**${key}:** ${value}`;
}

export function bold(str: string | number) {
  return `**${str}**`;
}
