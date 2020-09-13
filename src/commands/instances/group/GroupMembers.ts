import { Embeds } from 'discord-paginationembed';
import { MessageEmbed } from 'discord.js';
import { fetchGroupDetails, fetchGroupMembers } from '../../../api/modules/groups';
import { Player } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';

const RESULTS_PER_PAGE = 20;

class GroupMembers implements Command {
  name: string;
  template: string;
  requiresGroup?: boolean | undefined;
  requiresPagination?: boolean | undefined;

  constructor() {
    this.name = 'View group members list';
    this.template = '!group members';
    this.requiresGroup = true;
    this.requiresPagination = true;
  }

  activated(message: ParsedMessage) {
    const { command, args } = message;
    return command === 'group' && args.length >= 1 && args[0] === 'members';
  }

  async execute(message: ParsedMessage) {
    const groupId = message.originServer?.groupId || -1;

    try {
      const group = await fetchGroupDetails(groupId);
      const members = await fetchGroupMembers(groupId);

      const pageCount = Math.ceil(members.length / RESULTS_PER_PAGE);
      const pages = [];

      for (let i = 0; i < pageCount; i++) {
        const response = new MessageEmbed()
          .setColor(config.visuals.blue)
          .setTitle(`${group.name} members list`)
          .setDescription(this.buildList(members, i))
          .setURL(`https://wiseoldman.net/groups/${groupId}/members/`);

        pages.push(response);
      }

      new Embeds()
        .setArray(pages)
        .setChannel(<any>message.sourceMessage.channel)
        .setPageIndicator(true)
        .build();
    } catch (e) {
      throw new CommandError(e.response?.data?.message);
    }
  }

  buildList(members: Player[], page: number) {
    return members
      .slice(page * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
      .map((g, i) => `${page * RESULTS_PER_PAGE + i + 1}. **${g.displayName}** ${g.role === 'leader' ? getEmoji('crown') : ''} `)
      .join('\n');
  }
}

export default new GroupMembers();
