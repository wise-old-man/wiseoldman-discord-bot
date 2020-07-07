import { MessageEmbed } from 'discord.js';
import config from '../../config';
import { getChannelIds } from '../../database/services/server';
import { Event } from '../../types';
import { getEmoji, getMetricName, propagate } from '../../utils';

interface CompetitionEndingData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    title: string;
    duration: string;
  };
  period: {
    hours?: number;
    minutes?: number;
  };
}

class CompetitionEnding implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_ENDING';
  }

  async execute(data: CompetitionEndingData): Promise<void> {
    const { groupId, competition, period } = data;
    const { id, metric, duration, title } = competition;

    if (!groupId) return;

    const channelIds = await getChannelIds(groupId);

    // If no servers/channels care about this group
    if (!channelIds || channelIds.length === 0) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Duration', value: duration }
    ];

    if (period.minutes && period.minutes < 60) {
      const emoji = getEmoji('warning');
      fields.push({
        name: `\u200B`,
        value: `${emoji} Don't forget to update your account's hiscores **before the time is up!**`
      });
    }

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('clock')} ${title} is ending in ${timeLeft}`)
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

export default new CompetitionEnding();
