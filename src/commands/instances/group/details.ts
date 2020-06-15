import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails } from '../../../api/modules/group';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

class DetailsCommand implements Command {
  name: string;
  template: string;
  requiresAdmin?: boolean | undefined;
  requiresGroup?: boolean | undefined;

  constructor() {
    this.name = 'View group details';
    this.template = '!group details';
    this.requiresGroup = true;
  }

  activated(message: ParsedMessage) {
    return message.command === 'group' && message.args.length > 0 && message.args[0] === 'details';
  }

  async execute(message: ParsedMessage) {
    const groupId = config.testGroupId;

    try {
      const group = await fetchGroupDetails(groupId);
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
}

export default new DetailsCommand();
