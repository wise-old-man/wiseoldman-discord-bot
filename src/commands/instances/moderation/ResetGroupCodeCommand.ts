import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { resetGroupCode } from '~/services/wiseoldman';
import config from '~/config';
import { Command, CommandConfig, CommandError, ErrorCode, hasModeratorRole } from '~/utils';

const DM_MESSAGE = (code: string) =>
  `Hey! Here's your new verification code: \`${code}\`. \nPlease save it somewhere safe and be mindful of who you choose to share it with.`;

const CHAT_MESSAGE = (userId: string) =>
  `Verification code successfully reset. A DM has been sent to <@${userId}>.`;

const CONFIG: CommandConfig = {
  name: 'reset-group-code',
  description: "Reset a group's verification code.",
  options: [
    {
      type: 'integer',
      name: 'id',
      required: true,
      description: 'The group ID.'
    },
    {
      type: 'user',
      name: 'user',
      required: true,
      description: 'Discord user tag.'
    }
  ]
};

class ResetGroupCodeCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    if (!hasModeratorRole(interaction.member as GuildMember)) {
      interaction.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const groupId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError(ErrorCode.USER_NOT_FOUND);
    }

    const { newCode } = await resetGroupCode(groupId);

    // DM the user back with the new verification code
    await user.send(DM_MESSAGE(newCode));

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await interaction.editReply({ embeds: [response] });
  }
}

export default new ResetGroupCodeCommand();
