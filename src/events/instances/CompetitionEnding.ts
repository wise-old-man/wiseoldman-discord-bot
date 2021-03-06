import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { BroadcastType, Event } from '../../types';
import { getEmoji, getMetricName, broadcastMessage } from '../../utils';

interface CompetitionEndingData {
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

class CompetitionEnding implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_ENDING';
  }

  async execute(data: CompetitionEndingData): Promise<void> {
    const { groupId, competition, period } = data;
    const { id, metric, duration, type, title } = competition;

    if (!groupId) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
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

    broadcastMessage(groupId, BroadcastType.CompetitionStatus, message);
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
