import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { resetCode } from '../../../api/modules/groups';
import config from '../../../config';
import { hasModeratorRole } from '../../../utils';
import { Command, CommandConfig } from '../../utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';

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

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const groupId = message.options.getInteger('id', true);
    const userId = message.options.getUser('user', true).id;

    const user = message.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError(ErrorCode.USER_NOT_FOUND);
    }

    const { newCode } = await resetCode(groupId);

    // DM the user back with the new verification code
    await user.send(DM_MESSAGE(newCode));

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(CHAT_MESSAGE(userId));

    await message.editReply({ embeds: [response] });
  }
}

export default new ResetGroupCodeCommand();
