import { Client, EmbedBuilder } from 'discord.js';
import { capitalize } from 'lodash';
import { Competition, getMetricName } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { getEmoji, propagateMessage, durationBetween, NotificationType } from '../../utils';

interface CompetitionCreatedData {
  groupId: number;
  competition: Competition;
}

class CompetitionCreated implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_CREATED';
  }

  async execute(data: CompetitionCreatedData, client: Client) {
    const { groupId, competition } = data;
    const { id, metric, type, title, startsAt, endsAt } = competition;

    if (!groupId) return;

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
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

    await propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
  }
}

export default new CompetitionCreated();
