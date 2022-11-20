import { getMetricName, Metric } from '@wise-old-man/utils';
import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../types';
import { getEmoji, broadcastMessage, durationBetween, BroadcastType } from '../../utils';

interface CompetitionStartedData {
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

class CompetitionStarted implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTED';
  }

  async execute(data: CompetitionStartedData): Promise<void> {
    const { groupId, competition } = data;
    const { id, metric, startsAt, endsAt, type, title } = competition;

    if (!groupId) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Ends in', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${getEmoji('speaker')} ${title} has started!`)
      .setURL(url)
      .addFields(fields);

    broadcastMessage(groupId, BroadcastType.CompetitionStatus, message);
  }
}

export default new CompetitionStarted();
