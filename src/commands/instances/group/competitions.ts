import { MessageEmbed } from 'discord.js';
import { getCompetitionStatus } from '../../../api/modules/competition';
import { fetchGroupCompetitions, fetchGroupDetails } from '../../../api/modules/group';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

const MAX_COMPETITIONS = 5;

class CompetitionsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
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
    const groupId = config.testGroupId;

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
        const status = getCompetitionStatus(c);
        const participants = `${c.participantCount} participants`;

        return {
          name: c.title,
          value: `${icon} • ${participants} • ${status}`
        };
      });
  }
}

export default new CompetitionsCommand();
