import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, formatDate, getLinkedGroupId } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'details',
  description: "View the group's details."
};

class GroupDetailsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction): Promise<void> {
    const groupId = await getLinkedGroupId(interaction);

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(group.name)
      .setURL(`https://wiseoldman.net/groups/${group.id}`)
      .addFields([
        { name: 'Clan chat', value: group.clanChat || '---' },
        { name: 'Members', value: group.memberCount?.toString() || '0' },
        { name: 'Created at', value: formatDate(group.createdAt, 'DD MMM, YYYY') }
      ]);

    if (!group.verified) {
      response.setFooter({
        text: `Tip: If you want to verify your group check out the /help command (category: Verified).`
      });
    }

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupDetailsCommand();
