import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { Command, Competition, ParsedMessage } from '../../../types';
import { durationBetween, getEmoji } from '../../../utils';
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
      const group = await this.fetchGroupInfo(groupId);
      const competitions = await this.fetchGroupCompetitions(groupId);
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
    return competitions.map(c => {
      const icon = getEmoji(c.metric);
      const status = this.getStatus(c);
      const participants = `${c.participantCount} participants`;

      return {
        name: c.title,
        value: `${icon} • ${participants} • ${status}`
      };
    });
  }

  getStatus(competition: Competition) {
    const now = new Date();
    const endsAt = new Date(competition.endsAt);
    const startsAt = new Date(competition.startsAt);

    if (endsAt.getTime() < now.getTime()) {
      return `Ended at ${endsAt.toLocaleDateString()}`;
    }

    if (startsAt.getTime() < now.getTime()) {
      const timeLeft = durationBetween(now, endsAt, 2);
      return `Ends in ${timeLeft}`;
    }

    const timeLeft = durationBetween(now, startsAt, 2);
    return `Starting in ${timeLeft}`;
  }

  /**
   * Fetch the group details from the API.
   */
  async fetchGroupInfo(id: number) {
    const URL = `${config.baseAPIUrl}/groups/${id}`;
    const { data } = await axios.get(URL);
    return data;
  }

  /**
   * Fetch all group competitions from the API.
   */
  async fetchGroupCompetitions(id: number): Promise<Competition[]> {
    const URL = `${config.baseAPIUrl}/groups/${id}/competitions`;
    const { data } = await axios.get(URL);

    if (data.length === 0) {
      return [];
    }

    // Only show the 5 most recent competitions
    return data
      .sort((a: Competition, b: Competition) => {
        return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
      })
      .slice(0, MAX_COMPETITIONS);
  }
}

export default new CompetitionsCommand();
