import { CommandInteraction, MessageEmbed } from 'discord.js';
import { resetCompetitionCode } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \n\`${code}\`\n\nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

const CONFIG: CommandConfig = {
  name: 'reset-competition-code',
  description: "Reset a competition's verification code.",
  options: [
    {
      name: 'id',
      type: 'integer',
      description: 'The competition ID.',
      required: true
    },
    {
      type: 'user',
      name: 'user',
      description: 'Discord user tag.',
      required: true
    }
  ]
};

class ResetCompetitionCodeCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const competitionId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const { newCode } = await resetCompetitionCode(competitionId).catch(e => {
      if (e.statusCode === 400) throw new CommandError(e.message);
      if (e.statusCode === 404) throw new CommandError('Competition not found.');

      throw e;
    });

    // DM the user back with the new verification code
    await user.send(DM_MESSAGE(newCode));

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Reset competition code (ID: ${competitionId}) - Sent to <@${user.id}>`,
      interaction.user
    );
  }
}

export default new ResetCompetitionCodeCommand();
