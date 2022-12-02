import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '~/services/wiseoldman';
import config from '~/config';
import { CommandConfig, Command, getLinkedGroupId, CommandError, bold } from '~/utils';
import { createPaginatedEmbed } from '~/commands/pagination';

const RESULTS_PER_PAGE = 20;

const CONFIG: CommandConfig = {
  name: 'members',
  description: "View the group's members list."
};

class GroupMembersCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    // Restrict to 25 pages because that's the limit on a paginated message
    const pageCount = Math.min(25, Math.ceil(group.memberships.length / RESULTS_PER_PAGE));

    const embedTemplate = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`${group.name} members list`)
      .setURL(`https://wiseoldman.net/groups/${groupId}/members/`)
      .setFooter({ text: group.memberships.length > 500 ? 'Click the title to view full list' : '' });

    const paginatedMessage = createPaginatedEmbed(embedTemplate, 120_000);

    for (let i = 0; i < pageCount; i++) {
      const memberList = group.memberships
        .slice(i * RESULTS_PER_PAGE, i * RESULTS_PER_PAGE + RESULTS_PER_PAGE)
        .map((g, i) => `${i * RESULTS_PER_PAGE + i + 1}. ${bold(g.player.displayName)}`)
        .join('\n');

      paginatedMessage.addPageEmbed(new MessageEmbed().setDescription(memberList));
    }

    paginatedMessage.run(interaction);
  }
}

export default new GroupMembersCommand();
