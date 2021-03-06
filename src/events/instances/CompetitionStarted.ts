import { MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { BroadcastType, Event } from '../../types';
import { getEmoji, getMetricName, broadcastMessage } from '../../utils';

interface CompetitionStartedData {
  groupId: number;
  competition: {
    id: number;
    metric: string;
    type: string;
    title: string;
    duration: string;
  };
}

class CompetitionStarted implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTED';
  }

  async execute(data: CompetitionStartedData): Promise<void> {
    const { groupId, competition } = data;
    const { id, metric, duration, type, title } = competition;

    if (!groupId) return;

    const url = `https://wiseoldman.net/competitions/${id}`;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Ends in', value: duration }
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
