import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, propagate, toKMB } from '../../utils';

interface CompetitionStanding {
  displayName: string;
  gained: number;
}

interface CompetitionEndedData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    title: string;
    duration: string;
  };
  standings: CompetitionStanding[];
}

class CompetitionEnded implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_ENDED';
  }

  async execute(data: CompetitionEndedData): Promise<void> {
    const { groupId, competition, standings } = data;
    const { id, title } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    // If no servers/channels care about this group
    if (!channelIds || channelIds.length === 0) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} ${title} has ended!`)
      .setURL(url)
      .addFields([
        {
          name: 'Top participants',
          value: getStandings(standings)
        }
      ]);

    propagate(message, channelIds);
  }
}

function getStandings(standings: CompetitionStanding[]): string {
  return standings
    .slice(0, 3)
    .map((s, i) => `${getStandingEmoji(i + 1)} ${i + 1}. ${s.displayName} - **${toKMB(s.gained)}**`)
    .join('\n');
}

function getStandingEmoji(place: number) {
  switch (place) {
    case 1:
      return getEmoji('gold_medal');
    case 2:
      return getEmoji('silver_medal');
    case 3:
      return getEmoji('bronze_medal');
  }
}

export default new CompetitionEnded();
