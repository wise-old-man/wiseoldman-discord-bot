import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { deletePlayer } from '../../../services/wiseoldman';
import config from '../../../config';
import { getEmoji, hasModeratorRole } from '../../../utils';
import { Command, CommandConfig } from '../../utils/commands';

const CONFIG: CommandConfig = {
  name: 'delete-player',
  description: 'Delete a player from the database.',
  options: [
    {
      type: 'string',
      required: true,
      name: 'username',
      description: 'The username of the player to delete.'
    }
  ]
};

class DeletePlayerCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(message: CommandInteraction) {
    if (!hasModeratorRole(message.member as GuildMember)) {
      message.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const username = message.options.getString('username', true);

    await deletePlayer(username);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`${getEmoji('success')} \`${username}\` has been successfully deleted!`);

    await message.editReply({ embeds: [response] });
  }
}

export default new DeletePlayerCommand();
