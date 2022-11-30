import { getMetricName, Metric } from '@wise-old-man/utils';
import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../types';
import { getEmoji, broadcastMessage, durationBetween, BroadcastType } from '../../utils';

interface CompetitionEndingData {
  groupId: number;
  competition: {
    id: number;
    metric: Metric;
    type: string;
    title: string;
    startsAt: string;
    endsAt: string;
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
    const { id, metric, type, title, startsAt, endsAt } = competition;

    if (!groupId) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
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

    broadcastMessage(groupId, BroadcastType.COMPETITION_STATUS, message);
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
