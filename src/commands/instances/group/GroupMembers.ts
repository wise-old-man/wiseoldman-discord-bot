import { MessageEmbed, Constants } from 'discord.js';
import { fetchGroupDetails, fetchGroupMembers } from '../../../api/modules/groups';
import { Player } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

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

      // Restrict to 25 pages because that's the limit on a paginated message
      const pageCount = Math.min(25, Math.ceil(members.length / RESULTS_PER_PAGE));

      const paginatedMessage = new PaginatedMessage({
        pageIndexPrefix: 'Page',
        embedFooterSeparator: '|',
        actions: [
          {
            customId: 'CustomPreviousAction',
            type: Constants.MessageComponentTypes.BUTTON,
            style: 'PRIMARY',
            label: '<',
            run: ({ handler }) => {
              if (handler.index === 0) handler.index = handler.pages.length - 1;
              else --handler.index;
            }
          },
          {
            customId: 'CustomNextAction',
            type: Constants.MessageComponentTypes.BUTTON,
            style: 'PRIMARY',
            label: '>',
            run: ({ handler }) => {
              if (handler.index === handler.pages.length - 1) handler.index = 0;
              else ++handler.index;
            }
          }
        ],
        template: new MessageEmbed()
          .setColor(config.visuals.blue)
          .setTitle(`${group.name} members list`)
          .setURL(`https://wiseoldman.net/groups/${groupId}/members/`)
      });

      for (let i = 0; i < pageCount; i++) {
        paginatedMessage.addPageEmbed(new MessageEmbed().setDescription(this.buildList(members, i)));
      }

      paginatedMessage.idle = 30000;
      paginatedMessage.run(message.sourceMessage);
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(members: Player[], page: number) {
    return members
      .slice(page * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
      .map(
        (g, i) =>
          `${page * RESULTS_PER_PAGE + i + 1}. **${g.displayName}** ${
            g.role === 'leader' ? getEmoji('crown') : ''
          } `
      )
      .join('\n');
  }
}

export default new GroupMembers();
