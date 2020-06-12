import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../config';
import { ActivityResult, Command, MetricType, ParsedMessage } from '../../types';
import { getEmoji, getMetricName, toKMB, toResults } from '../../utils';
import { durationSince } from '../../utils/dates';
import CommandError from '../CommandError';

class ActivitiesCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'View player activity scores';
    this.template = '!activities {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'activities';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');

    try {
      const player = await this.fetchPlayer(username);
      const fields = this.buildActivityFields(player.latestSnapshot);
      const updatedAgo = durationSince(new Date(player.updatedAt), 2);
      const pageURL = `https://wiseoldman.net/players/${player.id}/overview/activities`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(player.displayName)
        .setURL(pageURL)
        .addFields(fields)
        .setFooter(`Last updated: ${updatedAgo} ago`);

      message.respond(response);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async fetchPlayer(username: string) {
    const URL = `${config.baseAPIUrl}/players?username=${username}`;
    const { data } = await axios.get(URL);
    return data;
  }

  buildActivityFields(snapshot: Object): EmbedFieldData[] {
    // Convert the snapshot into activity results
    const activityResults = <ActivityResult[]>toResults(snapshot, MetricType.Activity);

    // Convert each activity result into an embed field
    return activityResults.map(r => {
      const activityName = getMetricName(r.name);
      const activityEmoji = getEmoji('cooking');
      const score = toKMB(r.score);

      return {
        name: `${activityEmoji} ${activityName}`,
        value: `\`${score}\``,
        inline: true
      };
    });
  }
}

export default new ActivitiesCommand();
