import { MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import config from '../../../config';
import { updateUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import CommandError from '../../CommandError';

class PlayerSetUsername implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Set player username (alias)';
    this.template = '!setrsn {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'setrsn';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');
    const userId = message.sourceMessage.author.id;

    try {
      const player = await fetchPlayer(username);

      await updateUsername(userId, player.displayName);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setTitle('Player alias updated!')
        .setURL(`https://wiseoldman.net/players/${player.id}`)
        .setDescription(`<@${userId}> is now associated with the username \`${player.displayName}\`.`)
        .setFooter(`They can now call any player command without including the username.`);

      message.respond(response);
    } catch (e) {
      if (e.response?.status === 400) {
        throw new CommandError(
          `Failed to find player with username \`${username}\``,
          'Maybe try to update that username first?'
        );
      } else {
        throw new CommandError('Failed to update player alias.');
      }
    }
  }
}

export default new PlayerSetUsername();
