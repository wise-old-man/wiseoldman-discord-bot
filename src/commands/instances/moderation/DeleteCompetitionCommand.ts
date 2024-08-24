import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { deleteCompetition } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-competition',
  description: 'Delete a competition.',
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'id',
      description: 'The competition ID.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.User,
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

  async execute(interaction: ChatInputCommandInteraction) {
    const competitionId = interaction.options.getInteger('id', true);
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await deleteCompetition(competitionId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Competition not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(`✅ Competition has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Deleted Competition**\nCompetition: \`${competitionId}\`` +
        (requesterId
          ? `\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester?.user.username}\``
          : ''),
      interaction.user
    );
  }
}

export default new DeleteCompetitionCommand();
