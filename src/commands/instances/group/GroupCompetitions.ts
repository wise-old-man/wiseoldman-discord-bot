import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import { getCompetitionStatus, getCompetitionTimeLeft } from '../../../api/modules/competitions';
import { fetchGroupCompetitions, fetchGroupDetails } from '../../../api/modules/groups';
import { Competition } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

const MAX_COMPETITIONS = 5;

const STATUS_ORDER = ['ongoing', 'upcoming', 'finished'];

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
    const groupId = message.originServer?.groupId || -1;

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

      message.respond({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildCompetitionsList(competitions: Competition[]) {
    return competitions
      .map(c => ({ ...c, status: getCompetitionStatus(c) }))
      .sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
          a.startsAt.getTime() - b.startsAt.getTime() ||
          a.endsAt.getTime() - b.endsAt.getTime()
      )
      .slice(0, MAX_COMPETITIONS)
      .map(c => {
        const icon = getEmoji(c.metric);
        const type = capitalize(c.type);
        const timeLeft = getCompetitionTimeLeft(c);
        const participants = `${c.participantCount} participants`;
        const id = c.id;

        return {
          name: `${c.title}`,
          value: `${icon} • ${type} • ${participants} • ${timeLeft} - ID: ${id}`
        };
      });
  }
}

export default new GroupCompetitions();
