import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate, toKMB } from '../../utils';

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
    const { id, metric, duration, title } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);
    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Duration', value: duration },
      {
        name: 'Top participants',
        value: standings
          .slice(0, 3)
          .map((s, i) => {
            const place = i + 1;
            const emoji = getStandingEmoji(place);
            return `${emoji} ${place}. ${s.displayName} - **${toKMB(s.gained)}**`;
          })
          .join('\n')
      }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} A competition has ended!`)
      .setURL(url)
      .addFields(fields);

    propagate(message, channelIds);
  }
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
