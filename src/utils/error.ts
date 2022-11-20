import { Interaction, MessageEmbed } from 'discord.js';
import config from '../config';

export class CommandErrorAlt extends Error {
  tip?: string;
  errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message?: string, tip?: string) {
    const msg = message || ErrorMessageMap[errorCode];

    super(msg);
    this.name = 'CommandError';
    this.errorCode = errorCode;
    this.message = msg;

    if (tip) this.tip = tip;
  }
}

export enum ErrorCode {
  UNDEFINED_GUILD_ID = 'undefined_guild_id',
  UNDEFINED_GROUP_ID = 'undefined_group_id',
  NOT_IN_GUILD = 'not_in_guild',
  NO_COMPETITIONS_FOUND = 'no_competitions_found',
  NO_ONGOING_COMPETITIONS_FOUND = 'no_ongoing_competitions_found',
  NO_UPCOMING_COMPETITIONS_FOUND = 'no_upcoming_competitions_found',
  COMPETITION_NOT_FOUND = 'competition_not_found',
  GROUP_NOT_FOUND = 'group_not_found'
}

const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.UNDEFINED_GUILD_ID]: `Couldn't find the origin server for this interaction.`,
  [ErrorCode.UNDEFINED_GROUP_ID]: `Couldn't find the configured group for this server.`,
  [ErrorCode.NO_COMPETITIONS_FOUND]: `Couldn't find any competitions for this group.`,
  [ErrorCode.NO_ONGOING_COMPETITIONS_FOUND]: `No ongoing competitions found.`,
  [ErrorCode.NO_UPCOMING_COMPETITIONS_FOUND]: `No upcoming competitions found.`,
  [ErrorCode.COMPETITION_NOT_FOUND]: `Couldn't find that competition.`,
  [ErrorCode.GROUP_NOT_FOUND]: `Couldn't find that group.`,
  [ErrorCode.NOT_IN_GUILD]: `This command can only be used in a Discord server.`
};

export function handleError(interaction: Interaction, error: Error) {
  if (!interaction.isCommand()) return;

  const response = new MessageEmbed().setColor(config.visuals.red);

  if (error instanceof CommandErrorAlt) {
    response.setDescription(error.message);
    if (error.tip) response.setFooter({ text: error.tip });
  } else {
    response.setDescription('An unexpected error occurred.');
  }

  interaction.followUp({ embeds: [response] });
}
