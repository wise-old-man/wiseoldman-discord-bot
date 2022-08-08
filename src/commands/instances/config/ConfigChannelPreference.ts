import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { setChannelPreference } from '../../../database/services/channelPreferences';
import { BroadcastType, Command, ParsedMessage } from '../../../types';
import { getEmoji, getBroadcastName } from '../../../utils';
import CommandError from '../../CommandError';

class ConfigChannelPreference implements Command {
  name: string;
  template: string;
  requiresAdmin: boolean;

  constructor() {
    this.name = 'Configure the prefered broadcast channels.';
    this.template = '!config channel:{broadcast-type} {#channel}/here/none';
    this.requiresAdmin = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return (
      command === 'config' &&
      args.length >= 2 &&
      args[0].startsWith('channel:') &&
      args[0] !== 'channel:default'
    );
  }

  async execute(message: ParsedMessage) {
    try {
      const guildId = message.sourceMessage.guild?.id || '';

      const channelId = this.getChannelId(message);
      const broadcastType = this.getBroadcastType(message.args[0]);
      const broadcastName = getBroadcastName(broadcastType);

      await setChannelPreference(guildId, broadcastType, channelId);

      const description = channelId
        ? `"${broadcastName}" broadcasts will now be sent to <#${channelId}>`
        : `"${broadcastName}" broadcasts have now been disabled.`;

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle(`${getEmoji('success')} Channel Preference updated`)
        .setDescription(description);

      message.respond({ embeds: [response] });
    } catch (error: any) {
      console.log(error);
      this.handleFailure(error);
    }
  }

  handleFailure(error: Error) {
    if (error.message === "Couldn't find any valid channel argument.") {
      throw new CommandError(
        `Couldn't find channel.`,
        `You can either tag a channel (Ex: #general) or use "here" or "none" (No quotes).`
      );
    } else if (error.message === 'Invalid broadcast type.') {
      throw new CommandError(
        `Invalid channel preference type.`,
        `Please visit bot.wiseoldman.net for a list of valid preference types.`
      );
    } else {
      throw new CommandError('Failed to update channel preference.');
    }
  }

  getBroadcastType(typeArg: string): BroadcastType {
    switch (typeArg.toLowerCase()) {
      case 'channel:competition-status':
        return BroadcastType.CompetitionStatus;
      case 'channel:member-achievements':
        return BroadcastType.MemberAchievements;
      case 'channel:member-hcim-died':
        return BroadcastType.MemberHardcoreDied;
      case 'channel:member-name-changed':
        return BroadcastType.MemberNameChanged;
      case 'channel:members-list-changed':
        return BroadcastType.MembersListChanged;
    }

    throw Error('Invalid broadcast type.');
  }

  getChannelId(message: ParsedMessage) {
    const channelArg = message.args[message.args.length - 1].toLowerCase();

    if (channelArg === 'none') return null;
    if (channelArg === 'here') return message.sourceMessage.channel.id;

    const channelTag = channelArg.startsWith('<#') ? channelArg : null;

    if (!channelTag) throw new Error("Couldn't find any valid channel argument.");

    const channelId = channelTag.replace('<#', '').replace('>', '');
    const channel = message.sourceMessage.guild?.channels.cache.get(channelId);

    if (!channel) throw new Error("Couldn't find any valid channel argument.");

    return channel.id;
  }
}

export default new ConfigChannelPreference();
