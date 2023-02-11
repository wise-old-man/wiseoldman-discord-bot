import { Competition, getMetricName } from '@wise-old-man/utils';
import { Client, MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../utils/events';
import { broadcastMessage, BroadcastType, durationBetween, getEmoji } from '../../utils';

interface CompetitionStartingData {
  groupId: number;
  competition: Competition;
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

  async execute(data: CompetitionStartingData, client: Client) {
    console.time('A');
    const { groupId, competition, period } = data;
    const { id, metric, startsAt, endsAt, type, title } = competition;

    if (!groupId) return;

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) return;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`🕒 ${title} is starting in ${timeLeft}`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    await broadcastMessage(client, groupId, BroadcastType.COMPETITION_STATUS, message);
    console.timeEnd('A');
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
