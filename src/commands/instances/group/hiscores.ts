import axios from 'axios';
import { EmbedFieldData, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { Command, HiscoresResult, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, isBoss, isSkill, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class HiscoresCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;

  constructor() {
    this.name = 'View group hiscores';
    this.template = '!group hiscores {metric}';
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'hiscores';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;
    const metric = message.args.length >= 2 ? message.args[1] : 'overall';

    try {
      const group = await this.fetchGroupInfo(groupId);
      const hiscores = await this.fetchGroupHiscores(groupId, metric);
      const pageURL = `https://wiseoldman.net/groups/${groupId}/hiscores/`;
      const fields = this.buildHiscoresFields(metric, hiscores);
      const icon = getEmoji(metric);

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${icon} ${group.name} ${getMetricName(metric)} Hiscores`)
        .setURL(pageURL)
        .addFields(fields);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildHiscoresFields(metric: string, hiscores: HiscoresResult[]): EmbedFieldData[] {
    return hiscores.map(result => {
      const name = result.displayName;
      const value = this.getValue(metric, result);

      return {
        name: name,
        value: `\`${value}\``,
        inline: true
      };
    });
  }

  getValue(metric: string, result: HiscoresResult): string {
    if (isSkill(metric)) {
      return `${result.level} (${toKMB(result.experience || 0)})`;
    }

    if (isBoss(metric)) {
      return `${toKMB(result.kills || 0)}`;
    }

    return `${toKMB(result.score || 0)}`;
  }

  /**
   * Fetch the group details from the API.
   */
  async fetchGroupInfo(id: number) {
    const URL = `${config.baseAPIUrl}/groups/${id}`;
    const { data } = await axios.get(URL);
    return data;
  }

  /**
   * Fetch group hiscores from the API.
   */
  async fetchGroupHiscores(id: number, metric: string) {
    const URL = `${config.baseAPIUrl}/groups/${id}/hiscores`;
    const params = { metric: metric.toLowerCase(), limit: 21 };
    const { data } = await axios.get(URL, { params });

    return data;
  }
}

export default new HiscoresCommand();
