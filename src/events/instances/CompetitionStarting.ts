import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate } from '../../utils';

interface CompetitionStartingData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    type: string;
    title: string;
    duration: string;
  };
  period: {
    hours?: number;
    minutes?: number;
  };
}

class CompetitionStarting implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTING';
  }

  async execute(data: CompetitionStartingData): Promise<void> {
    const { groupId, competition, period } = data;
    const { id, metric, duration, type, title } = competition;

    if (!groupId) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const channelIds = await getChannelIds(groupId);

    // If no servers/channels care about this group
    if (!channelIds || channelIds.length === 0) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: duration }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('clock')} ${title} is starting in ${timeLeft}`)
      .setURL(url)
      .addFields(fields);

    propagate(message, channelIds);
  }
}

function getTimeLeft(period: { hours?: number; minutes?: number }) {
  const { hours, minutes } = period;

  if (hours && hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  if (minutes && minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  return null;
}

export default new CompetitionStarting();
