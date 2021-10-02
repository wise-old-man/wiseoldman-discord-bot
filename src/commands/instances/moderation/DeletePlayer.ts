import { MessageEmbed } from 'discord.js';
import { deletePlayer } from '../../../api/modules/players';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

class DeletePlayer implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Delete a player and all its data.';
    this.template = '!delete-player {username}';
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'delete-player' &&
      message.args.length >= 1 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage) {
    if (!hasModeratorRole(message.sourceMessage.member)) {
      message.respond({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const username = message.args.join(' ');

    try {
      await deletePlayer(username);

      // Respond on the WOM discord chat with a success status
      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`${getEmoji('success')} \`${username}\` has been successfully deleted!`);

      message.respond({ embeds: [response] });
    } catch (error) {
      throw new CommandError('Failed to delete player.');
    }
  }
}

export default new DeletePlayer();
