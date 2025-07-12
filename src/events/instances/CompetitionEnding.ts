import { AsyncResult, errored } from '@attio/fetchable';
import { Competition, getMetricName } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import {
  durationBetween,
  getEmoji,
  MessagePropagationError,
  NotificationType,
  propagateMessage
} from '../../utils';
import { Event } from '../../utils/events';

type CompetitionEndingData = {
  groupId: number;
  competition: Competition;
} & (
  | {
      period: { hours?: number; minutes?: number };
    }
  | {
      minutesLeft: number;
    }
);

class CompetitionEnding implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_ENDING';
  }

  async execute(
    data: CompetitionEndingData,
    client: Client
  ): AsyncResult<
    true,
    { code: 'MISSING_GROUP_ID' } | { code: 'MISSING_TIME_LEFT' } | MessagePropagationError
  > {
    const { groupId, competition } = data;
    const { id, metric, type, title, startsAt, endsAt } = competition;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    // Soon the API will always return "minutesLeft", so "period" can be removed
    const timeLeft = 'period' in data ? getPeriodTimeLeft(data.period) : getTimeLeft(data.minutesLeft);

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

    const warningField = {
      name: `\u200B`,
      value: `⚠️ Don't forget to update your account's hiscores **before the time is up!**`
    };

    if ('period' in data) {
      if (data.period.minutes && data.period.minutes < 60) {
        fields.push(warningField);
      }
    } else if (data.minutesLeft < 60) {
      fields.push(warningField);
    }

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🕒 ${title} is ending in ${timeLeft}`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    return propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
  }
}

function getTimeLeft(minutesLeft: number) {
  if (minutesLeft >= 60) {
    const hours = Math.floor(minutesLeft / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  return `${minutesLeft} ${minutesLeft === 1 ? 'minute' : 'minutes'}`;
}

function getPeriodTimeLeft(period: { hours?: number; minutes?: number }) {
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
