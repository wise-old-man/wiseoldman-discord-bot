import { MessageEmbed } from 'discord.js';
import { getCompetitionTimeLeft } from '../../../api/modules/competitions';
import { fetchGroupCompetitions, fetchGroupDetails } from '../../../api/modules/groups';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

const MAX_COMPETITIONS = 5;

class GroupCompetitions implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group competitions';
    this.template = '!group competitions';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'group' && message.args.length > 0 && message.args[0] === 'competitions';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.server?.groupId || -1;

    try {
      const group = await fetchGroupDetails(groupId);
      const competitions = await fetchGroupCompetitions(groupId);
      const fields = this.buildCompetitionsList(competitions);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/competitions`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${group.name} competitions`)
        .setURL(pageURL)
        .addFields(fields);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildCompetitionsList(competitions: Competition[]) {
    return competitions
      .sort((a: Competition, b: Competition) => b.startsAt.getTime() - a.startsAt.getTime())
      .slice(0, MAX_COMPETITIONS)
      .map(c => {
        const icon = getEmoji(c.metric);
        const timeLeft = getCompetitionTimeLeft(c);
        const participants = `${c.participantCount} participants`;

        return {
          name: c.title,
          value: `${icon} • ${participants} • ${timeLeft}`
        };
      });
  }
}

export default new GroupCompetitions();
