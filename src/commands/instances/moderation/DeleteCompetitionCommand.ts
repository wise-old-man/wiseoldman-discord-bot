import { CommandInteraction, MessageEmbed } from 'discord.js';
import { deleteCompetition } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-competition',
  description: 'Delete a competition.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The competition ID.',
      required: true
    },
    {
      type: 'user',
      name: 'requester',
      description: "Requester's Discord user tag."
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
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await deleteCompetition(competitionId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Competition not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ Competition has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Deleted competition (ID: ${competitionId})`,
      interaction.user,
      requester?.user
    );
  }
}

export default new DeleteCompetitionCommand();
