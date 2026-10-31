import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { toggleGroupVisibility } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'toggle-group-visibility',
  description: 'Hide or unhide a group.',
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'id',
      description: 'The group ID.',
      required: true
    }
  ]
};

class ToggleGroupVisibilityCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);

    const { message } = await toggleGroupVisibility(groupId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Group not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder().setColor(config.visuals.green).setDescription(`✅ ${message}`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Group Visibility Toggled**\nGroup: [${groupId}](<https://wiseoldman.net/groups/${groupId}>)\n${message}`,
      interaction.user
    );
  }
}

export default new ToggleGroupVisibilityCommand();
