import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import { getMetricName, Metric } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../types';
import { getEmoji, broadcastMessage, durationBetween, BroadcastType } from '../../utils';

interface CompetitionCreatedData {
  groupId: number;
  competition: {
    id: number;
    metric: Metric;
    type: string;
    title: string;
    startsAt: string;
    endsAt: string;
  };
}

class CompetitionCreated implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_CREATED';
  }

  async execute(data: CompetitionCreatedData): Promise<void> {
    const { groupId, competition } = data;
    const { id, metric, type, title, startsAt, endsAt } = competition;

    if (!groupId) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Title', value: title },
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Duration', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('tada')} New competition created!`)
      .setURL(url)
      .addFields(fields)
      .setFooter({ text: 'Starts at' })
      .setTimestamp(new Date(startsAt));

    broadcastMessage(groupId, BroadcastType.CompetitionStatus, message);
  }
}

export default new CompetitionCreated();
