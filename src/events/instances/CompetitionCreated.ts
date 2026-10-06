import { AsyncResult, errored } from '@attio/fetchable';
import { CompetitionResponse } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import {
  durationBetween,
  formatMetricNames,
  MessagePropagationError,
  NotificationType,
  propagateMessage
} from '../../utils';
import { Event } from '../../utils/events';

interface CompetitionCreatedData {
  groupId: number;
  competition: CompetitionResponse;
}

class CompetitionCreated implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_CREATED';
  }

  async execute(
    data: CompetitionCreatedData,
    client: Client
  ): AsyncResult<true, { code: 'MISSING_GROUP_ID' } | MessagePropagationError> {
    const { groupId, competition } = data;
    const { id, metrics, type, title, startsAt, endsAt } = competition;

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metrics', value: formatMetricNames(metrics.map(m => m.metric)) },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`🎉 New competition created!`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields)
      .setFooter({ text: 'Starts at' })
      .setTimestamp(new Date(startsAt));

    return propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
  }
}

export default new CompetitionCreated();
