import { CommandInteraction, MessageEmbed } from 'discord.js';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { updateGroup } from '../../../services/prisma';
import { getEmoji } from '../../../utils';
import { CommandConfig, Command } from '../../utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';

const CONFIG: CommandConfig = {
  name: 'group',
  description: "VConfigure the server's Wise Old Man group.",
  options: [
    {
      type: 'integer',
      name: 'group_id',
      description: 'The group ID to link to the server.'
    }
  ]
};

class ConfigGroupCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guild?.id || '';

    if (!guildId || guildId.length === 0) {
      throw new CommandError(ErrorCode.NOT_IN_GUILD);
    }

    const groupId = interaction.options.getInteger('group_id', true);

    await updateGroup(guildId, groupId);

    const group = await womClient.groups.getGroupDetails(groupId);

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle(`${getEmoji('success')} Server group updated`)
      .setDescription(`All broadcasts and commands will be in reference to **${group.name}**`)
      .addFields({
        name: 'Page URL',
        value: `https://wiseoldman.net/groups/${groupId}`
      });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigGroupCommand();
