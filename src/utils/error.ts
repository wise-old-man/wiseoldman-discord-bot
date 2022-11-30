import { MessageEmbed } from 'discord.js';
import config from '../config';

export class CommandError extends Error {
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
  COMPETITION_NOT_FOUND = 'competition_not_found',
  GROUP_NOT_FOUND = 'group_not_found',
  INVALID_COMMAND = 'invalid_command',
  MISSING_ADMIN_PERMISSIONS = 'missing_admin_permissions',
  NAME_CHANGE_NOT_FOUND = 'name_change_not_found',
  NAME_CHANGE_NOT_PENDING = 'name_change_not_pending',
  NO_COMPETITIONS_FOUND = 'no_competitions_found',
  NO_ONGOING_COMPETITIONS_FOUND = 'no_ongoing_competitions_found',
  NO_UPCOMING_COMPETITIONS_FOUND = 'no_upcoming_competitions_found',
  NOT_IN_GUILD = 'not_in_guild',
  UNDEFINED_GROUP_ID = 'undefined_group_id',
  UNDEFINED_GUILD_ID = 'undefined_guild_id',
  USER_NOT_FOUND = 'user_not_found',
  PLAYER_NOT_FOUND = 'player_not_found',
  NOT_IN_FLAG_CHANNEL = 'not_in_flag_channel',
  INVALID_COUNTRY_CODE = 'invalid_country_code',
  HISCORES_DOWN = 'hiscores_down',
  FAILED_TO_UPDATE = 'failed_to_update'
}

const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.COMPETITION_NOT_FOUND]: `Couldn't find that competition.`,
  [ErrorCode.GROUP_NOT_FOUND]: `Couldn't find that group.`,
  [ErrorCode.INVALID_COMMAND]: `Invalid command.`,
  [ErrorCode.MISSING_ADMIN_PERMISSIONS]: `This command requires admin permissions.`,
  [ErrorCode.NAME_CHANGE_NOT_FOUND]: `Name change data was not found.`,
  [ErrorCode.NAME_CHANGE_NOT_PENDING]: `This name change is not pending.`,
  [ErrorCode.NO_COMPETITIONS_FOUND]: `Couldn't find any competitions for this group.`,
  [ErrorCode.NO_ONGOING_COMPETITIONS_FOUND]: `No ongoing competitions found.`,
  [ErrorCode.NO_UPCOMING_COMPETITIONS_FOUND]: `No upcoming competitions found.`,
  [ErrorCode.NOT_IN_GUILD]: `This command can only be used in a Discord server.`,
  [ErrorCode.UNDEFINED_GROUP_ID]: `Couldn't find the configured group for this server.`,
  [ErrorCode.UNDEFINED_GUILD_ID]: `Couldn't find the origin server for this interaction.`,
  [ErrorCode.USER_NOT_FOUND]: `Couldn't find that user.`,
  [ErrorCode.PLAYER_NOT_FOUND]: `Couldn't find that player.`,
  [ErrorCode.NOT_IN_FLAG_CHANNEL]: `This command only works in the **#change-flag** channel of the official Wise Old Man discord server.`,
  [ErrorCode.INVALID_COUNTRY_CODE]: `Invalid country code.`,
  [ErrorCode.HISCORES_DOWN]: `The hiscores are currently down. Please try again later.`,
  [ErrorCode.FAILED_TO_UPDATE]: `Failed to update player.`
};

export function getErrorResponse(error: Error) {
  const response = new MessageEmbed().setColor(config.visuals.red);

  if (error instanceof CommandError) {
    response.setDescription(error.message);
    if (error.tip) response.setFooter({ text: error.tip });
  } else {
    response.setDescription('An unexpected error occurred.');
  }

  return response;
}
