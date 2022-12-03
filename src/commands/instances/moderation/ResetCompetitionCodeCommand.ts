import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { resetCompetitionCode } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, hasModeratorRole } from '../../../utils';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \`${code}\`. \nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

const CONFIG: CommandConfig = {
  name: 'reset-competition-code',
  description: "Reset a competition's verification code.",
  options: [
    {
      type: 'integer',
      name: 'id',
      required: true,
      description: 'The competition ID.'
    },
    {
      type: 'user',
      name: 'user',
      required: true,
      description: 'Discord user tag.'
    }
  ]
};

class ResetCompetitionCodeCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    if (!hasModeratorRole(interaction.member as GuildMember)) {
      interaction.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const competitionId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const { newCode } = await resetCompetitionCode(competitionId);

    // DM the user back with the new verification code
    await user.send(DM_MESSAGE(newCode));

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ResetCompetitionCodeCommand();
