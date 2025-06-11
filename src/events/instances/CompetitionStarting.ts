import { Competition, getMetricName } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../utils/events';
import {
  propagateMessage,
  NotificationType,
  durationBetween,
  getEmoji,
  MessagePropagationError
} from '../../utils';
import { AsyncResult, errored } from '@attio/fetchable';

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

  async execute(
    data: CompetitionStartingData,
    client: Client
  ): AsyncResult<
    true,
    { code: 'MISSING_GROUP_ID' } | { code: 'MISSING_TIME_LEFT' } | MessagePropagationError
  > {
    const { groupId, competition, period } = data;
    const { id, metric, startsAt, endsAt, type, title } = competition;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const timeLeft = getTimeLeft(period);

    if (!timeLeft) {
      return errored({
        code: 'MISSING_TIME_LEFT'
      });
    }

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🕒 ${title} is starting in ${timeLeft}`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    return propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
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
