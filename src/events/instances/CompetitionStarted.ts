import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate } from '../../utils';

interface CompetitionStartedData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    title: string;
    duration: string;
  };
}

class CompetitionStarted implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTED';
  }

  async execute(data: CompetitionStartedData): Promise<void> {
    const { groupId, competition } = data;
    const { id, metric, duration, title } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    // If no servers/channels care about this group
    if (!channelIds || channelIds.length === 0) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Ends in', value: duration }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} ${title} has started!`)
      .setURL(url)
      .addFields(fields);

    propagate(message, channelIds);
  }
}

export default new CompetitionStarted();
