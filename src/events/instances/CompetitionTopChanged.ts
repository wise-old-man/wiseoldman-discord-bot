import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate, toKMB } from '../../utils';

interface CompetitionStanding {
  displayName: string;
  gained: number;
}

interface CompetitionTopChangedData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    title: string;
    endsAt: string;
  };
  standings: CompetitionStanding[];
}

class CompetitionTopChanged implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_TOP_CHANGED';
  }

  async execute(data: CompetitionTopChangedData): Promise<void> {
    const { groupId, competition, standings } = data;
    const { id, metric, endsAt, title } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);
    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      {
        name: 'Top participants',
        value: standings
          .slice(0, 3)
          .map((s, i) => `${i + 1} -  ${s.displayName} - **${toKMB(s.gained)}**`)
          .join('\n')
      }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} A competition's top 3 has changed!`)
      .setURL(url)
      .addFields(fields)
      .setFooter('Ends at')
      .setTimestamp(new Date(endsAt));

    propagate(message, channelIds);
  }
}

export default new CompetitionTopChanged();
