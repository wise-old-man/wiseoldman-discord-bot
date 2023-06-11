import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import { updateServerGroup } from '../../../services/prisma';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'group',
  description: "Configure the server's Wise Old Man group.",
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
    this.requiresAdmin = true;
  }

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guild?.id || '';

    if (!guildId || guildId.length === 0) {
      throw new CommandError('This command can only be used in a Discord server.');
    }

    const groupId = interaction.options.getInteger('group_id', true);

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    // Update the server's group ID in the database
    await updateServerGroup(guildId, groupId);

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle(`✅ Server group updated`)
      .setDescription(`All notifications and commands will be in reference to **${group.name}**`)
      .addFields({
        name: 'Page URL',
        value: `https://wiseoldman.net/groups/${groupId}`
      });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigGroupCommand();
