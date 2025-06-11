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

interface CompetitionStartedData {
  groupId: number;
  competition: Competition;
}

class CompetitionStarted implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTED';
  }

  async execute(
    data: CompetitionStartedData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId, competition } = data;
    const { id, metric, startsAt, endsAt, type, title } = competition;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Ends in', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`📢 ${title} has started!`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    return propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
  }
}

export default new CompetitionStarted();
