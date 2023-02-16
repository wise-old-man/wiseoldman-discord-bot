import { Competition, getMetricName } from '@wise-old-man/utils';
import { Client, MessageEmbed } from 'discord.js';
import { capitalize } from 'lodash';
import config from '../../config';
import { Event } from '../../utils/events';
import { getEmoji, propagateMessage, durationBetween, NotificationType } from '../../utils';

interface CompetitionStartedData {
  groupId: number;
  competition: Competition;
}

class CompetitionStarted implements Event {
  type: string;

  constructor() {
    this.type = 'COMPETITION_STARTED';
  }

  async execute(data: CompetitionStartedData, client: Client) {
    const { groupId, competition } = data;
    const { id, metric, startsAt, endsAt, type, title } = competition;

    if (!groupId) return;

    const fields = [
      { name: 'Metric', value: `${getEmoji(metric)} ${getMetricName(metric)}` },
      { name: 'Type', value: capitalize(type) },
      { name: 'Ends in', value: durationBetween(new Date(startsAt), new Date(endsAt)) }
    ];

    const message = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`📢 ${title} has started!`)
      .setURL(`https://wiseoldman.net/competitions/${id}`)
      .addFields(fields);

    await propagateMessage(client, groupId, NotificationType.COMPETITION_STATUS, message);
  }
}

export default new CompetitionStarted();
