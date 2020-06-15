import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class InfoCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group information';
    this.template = '!group info';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'group' && message.args.length > 0 && message.args[0] === 'info';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;

    try {
      const group = await this.fetchGroupInfo(groupId);
      const pageURL = `https://wiseoldman.net/groups/${group.id}`;

      const verification = group.verified
        ? `${getEmoji('success')} Verified`
        : `${getEmoji('error')} Unverified`;

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(group.name)
        .setURL(pageURL)
        .addFields([
          { name: 'Clan chat', value: group.clanChat || '---' },
          { name: 'Members', value: group.memberCount || 0 },
          { name: 'Created at', value: formatDate(group.createdAt, 'DD MMM, YYYY') },
          { name: '\u200B', value: verification }
        ]);

      message.respond(response);
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  /**
   * Fetch the group details from the API.
   */
  async fetchGroupInfo(id: number) {
    const URL = `${config.baseAPIUrl}/groups/${id}`;
    const { data } = await axios.get(URL);
    return data;
  }
}

export default new InfoCommand();
