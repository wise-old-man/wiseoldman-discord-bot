import { CommandInteraction, MessageEmbed } from 'discord.js';
import { deleteCompetition } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-competition',
  description: 'Delete a competition.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The competition ID.',
      required: true
    }
  ]
};

class DeleteCompetitionCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const competitionId = interaction.options.getInteger('id', true);

    await deleteCompetition(competitionId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Competition not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ Competition has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new DeleteCompetitionCommand();
