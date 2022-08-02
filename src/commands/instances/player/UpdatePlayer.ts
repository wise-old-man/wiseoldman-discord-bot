import { MessageEmbed } from 'discord.js';
import { updatePlayer } from '../../../api/modules/players';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import CommandError from '../../CommandError';

class UpdatePlayer implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'Update player';
    this.template = '![update/track] {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'update' || message.command === 'track';
  }

  async execute(message: ParsedMessage) {
    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const result = await updatePlayer(username);

      const response = new MessageEmbed()
        .setColor(config.visuals.green)
        .setDescription(`Successfully updated **${result.displayName}**.`)
        .setFooter({
          text:
            'Tip: You can keep yourself automatically updated through Runelite by enabling Wise Old Man in the "XP Updater" plugin.'
        });

      message.respond({ embeds: [response] });
    } catch (e: any) {
      if (e.response?.status === 500) {
        throw new CommandError('Failed to update: OSRS Hiscores are unavailable.');
      } else {
        throw new CommandError(e.response?.data?.message || `Failed to update **${username}**.`);
      }
    }
  }

  async getUsername(message: ParsedMessage): Promise<string | undefined | null> {
    if (message.args && message.args.length > 0) {
      return message.args.join(' ');
    }

    const inferedUsername = await getUsername(message.sourceMessage.author.id);

    return inferedUsername;
  }
}

export default new UpdatePlayer();
