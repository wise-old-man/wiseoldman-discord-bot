import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import { formatDate, getEmoji } from '../../../utils';
import { CommandConfig, Command } from '../../utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';
import { getLinkedGroupId } from '../../../utils/wooow';

const CONFIG: CommandConfig = {
  name: 'details',
  description: "View the group's details."
};

class GroupDetailsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const groupId = await getLinkedGroupId(interaction);

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError(ErrorCode.GROUP_NOT_FOUND);
    });

    const verification = group.verified
      ? `${getEmoji('success')} Verified`
      : `${getEmoji('error')} Unverified`;

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(group.name)
      .setURL(`https://wiseoldman.net/groups/${group.id}`)
      .addFields([
        { name: 'Clan chat', value: group.clanChat || '---' },
        { name: 'Members', value: group.memberCount?.toString() || '0' },
        { name: 'Created at', value: formatDate(group.createdAt, 'DD MMM, YYYY') },
        { name: '\u200B', value: verification }
      ]);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupDetailsCommand();
