import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { resetGroupCode } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const DM_MESSAGE = (code: string, groupId: number) =>
  `Hey! Here's your new verification code for group ${groupId}: \n\`${code}\`\n\nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

const CONFIG: CommandConfig = {
  name: 'reset-group-code',
  description: "Reset a group's verification code.",
  options: [
    {
      type: ApplicationCommandOptionType.Integer,
      name: 'id',
      description: 'The group ID.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.User,
      name: 'user',
      description: 'Discord user tag.',
      required: true
    }
  ]
};

class ResetGroupCodeCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const sentDM = await user.send('Resetting group code...').catch(e => {
      console.log(e);

      throw new CommandError(
        `Failed to send DM to ${user}. Please go into Privacy Settings and enable Direct Messages.`
      );
    });

    const { newCode } = await resetGroupCode(groupId).catch(e => {
      sentDM.edit('Failed to generate a new verification code.');
      if (e.statusCode === 404) throw new CommandError(`Group '${groupId}' not found.`);
      throw e;
    });

    // DM the user back with the new verification code
    await sentDM.edit(DM_MESSAGE(newCode, groupId));

    // Respond on the WOM discord chat with a success status
    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Reset group code (ID: ${groupId}) - Sent to <@${user.id}>`,
      interaction.user
    );
  }
}

export default new ResetGroupCodeCommand();
