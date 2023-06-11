import { Competition, getMetricName } from '@wise-old-man/utils';
import { Client, MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../utils/events';
import { getEmoji, propagateMessage, durationBetween, NotificationType } from '../../utils';

interface CompetitionEndingData {
  groupId: number;
  competition: Competition;
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

  async execute(data: CompetitionEndingData, client: Client) {
    const { groupId, competition, period } = data;
    const { id, metric, type, title, startsAt, endsAt } = competition;

    if (!groupId) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    if (period.minutes && period.minutes < 60) {
      fields.push({
        name: `\u200B`,
        value: `⚠️ Don't forget to update your account's hiscores **before the time is up!**`
      });
    }

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`🕒 ${title} is ending in ${timeLeft}`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    await propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
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
