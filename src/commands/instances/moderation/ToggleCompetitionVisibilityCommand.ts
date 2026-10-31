import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { toggleCompetitionVisibility } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'toggle-competition-visibility',
  description: 'Hide or unhide a competition.',
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'id',
      description: 'The competition ID.',
      required: true
    }
  ]
};

class ToggleCompetitionVisibilityCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const competitionId = interaction.options.getInteger('id', true);

    const { message } = await toggleCompetitionVisibility(competitionId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Competition not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder().setColor(config.visuals.green).setDescription(`✅ ${message}`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Competition Visibility Toggled**\nCompetition: [${competitionId}](<https://wiseoldman.net/competitions/${competitionId}>)\n${message}`,
      interaction.user
    );
  }
}

export default new ToggleCompetitionVisibilityCommand();
