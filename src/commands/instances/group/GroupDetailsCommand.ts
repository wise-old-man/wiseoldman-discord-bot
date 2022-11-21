import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { CommandConfig, setupCommand } from '../../../utils/commands';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { SubCommand } from '../../../types';
import { formatDate, getEmoji } from '../../../utils';
import { CommandErrorAlt, ErrorCode, handleError } from '../../../utils/error';
import { getLinkedGroupId } from '../../../utils/wooow';

const CONFIG: CommandConfig = {
  name: 'details',
  description: "View the group's details."
};

class GroupDetailsCommand implements SubCommand {
  subcommand?: boolean | undefined;
  slashCommand?: SlashCommandSubcommandBuilder;

  constructor() {
    this.subcommand = true;
    this.slashCommand = setupCommand(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    try {
      await interaction.deferReply();

      const groupId = await getLinkedGroupId(interaction);

      const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
        throw new CommandErrorAlt(ErrorCode.GROUP_NOT_FOUND);
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
    } catch (error) {
      handleError(interaction, error);
    }
  }
}

export default new GroupDetailsCommand();
