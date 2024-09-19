import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import { updateServerGroup } from '../../../services/prisma';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'group',
  description: "Configure the server's Wise Old Man group.",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'group_id',
      description: 'The group ID to link to the server.',
      required: true
    }
  ]
};

class ConfigGroupCommand extends Command {
  constructor() {
    super(CONFIG);
    this.requiresAdmin = true;
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild?.id || '';

    if (!guildId || guildId.length === 0) {
      throw new CommandError('This command can only be used in a Discord server.');
    }

    const groupId = interaction.options.getInteger('group_id', true);

    if (groupId === null) {
      throw new CommandError('The provided group ID is invalid.');
    }

    const group = await womClient.groups.getGroupDetails(groupId).catch(() => {
      throw new CommandError("Couldn't find that group.");
    });

    // Update the server's group ID in the database
    await updateServerGroup(guildId, groupId);

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setTitle(`✅ Server group updated`)
      .setDescription(`All notifications and commands will be in reference to **${group.name}**`)
      .addFields({
        name: 'Page URL',
        value: `https://league.wiseoldman.net/groups/${groupId}`
      });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ConfigGroupCommand();
