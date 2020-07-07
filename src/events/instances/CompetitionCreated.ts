import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate } from '../../utils';

interface CompetitionCreatedData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    title: string;
    duration: string;
    startsAt: string;
  };
}

class CompetitionCreated implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_CREATED';
  }

  async execute(data: CompetitionCreatedData): Promise<void> {
    const { groupId, competition } = data;
    const { id, metric, duration, title, startsAt } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    // If no servers/channels care about this group
    if (!channelIds || channelIds.length === 0) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Duration', value: duration }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('tada')} New competition created!`)
      .setURL(url)
      .addFields(fields)
      .setFooter('Starts at')
      .setTimestamp(new Date(startsAt));

    propagate(message, channelIds);
  }
}

export default new CompetitionCreated();
