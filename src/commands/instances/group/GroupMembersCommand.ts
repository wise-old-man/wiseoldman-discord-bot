import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed, Constants } from 'discord.js';
import { MembershipWithPlayer } from '@wise-old-man/utils';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { getEmoji } from '../../../utils';
import CommandError from '../../CommandError';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { getServer } from '../../../services/prisma';
import womClient from '../../../api/wom-api';

const RESULTS_PER_PAGE = 20;

class GroupMembersCommand implements SubCommand {
  subcommand?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;

    this.slashCommand = new SlashCommandSubcommandBuilder()
      .setName('members')
      .setDescription("View the group's members list.");
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();
    const guildId = message.guild?.id;
    const server = await getServer(guildId); // maybe cache it so we don't have to do this
    const groupId = server?.groupId || -1;

    try {
      const group = await womClient.groups.getGroupDetails(groupId);

      // Restrict to 25 pages because that's the limit on a paginated message
      const pageCount = Math.min(25, Math.ceil(group.memberships.length / RESULTS_PER_PAGE));

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
          .setFooter({ text: group.memberships.length > 500 ? 'Click the title to view full list' : '' })
      });

      for (let i = 0; i < pageCount; i++) {
        paginatedMessage.addPageEmbed(
          new MessageEmbed().setDescription(this.buildList(group.memberships, i))
        );
      }

      paginatedMessage.idle = 120000;
      paginatedMessage.run(message);
    } catch (e: any) {
      if (e.response?.data?.message) {
        throw new CommandError(e.response?.data?.message);
      } else {
        throw new CommandError(e.name, e.message);
      }
    }
  }

  buildList(members: MembershipWithPlayer[], page: number) {
    return members
      .slice(page * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
      .map(
        (g, i) =>
          `${page * RESULTS_PER_PAGE + i + 1}. **${g.player.displayName}** ${
            g.role === 'leader' ? getEmoji('crown') : ''
          } `
      )
      .join('\n');
  }
}

export default new GroupMembersCommand();
