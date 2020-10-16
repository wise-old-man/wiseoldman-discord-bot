import { MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import { encodeURL, round, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class PlayerVirtuals implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player virtual stats';
    this.template = '![virtuals/ttm/ehp/ehb] {username}';
  }

  activated(message: ParsedMessage) {
    const cmd = message.command;
    return cmd === 'virtuals' || cmd === 'ttm' || cmd === 'ehp' || cmd === 'ehb';
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
      const player = await fetchPlayer(username);

      if (player.ehp === 0 && player.tt200m === 0) {
        throw new CommandError(`This player is outdated. Please try "!update ${username}" first.`);
      }

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
        .setTitle(`${player.displayName} - Virtual Stats`)
        .addFields([
          {
            name: 'Time To Max',
            value: player.ttm ? `${round(player.ttm, 2)} hours` : '---'
          },
          {
            name: 'Time To 200m All',
            value: player.tt200m ? `${round(player.tt200m, 2)} hours` : '---'
          },
          {
            name: 'Efficient Hours Played',
            value: player.ehp ? round(player.ehp, 2) : '---'
          },
          {
            name: 'Efficient Hours Bossed',
            value: player.ehb ? round(player.ehb, 2) : '---'
          },
          {
            name: 'Total Experience',
            value: player.exp ? toKMB(player.exp, 2) : '---'
          }
        ])
        .setFooter('Last updated')
        .setTimestamp(player.updatedAt);

      message.respond(embed);
    } catch (e) {
      if (e instanceof CommandError) throw e;

      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async getUsername(message: ParsedMessage): Promise<string | undefined | null> {
    const explicitUsername = message.args.filter(a => !a.startsWith('--')).join(' ');

    if (explicitUsername) {
      return explicitUsername;
    }

    const inferedUsername = await getUsername(message.sourceMessage.author.id);

    return inferedUsername;
  }
}

export default new PlayerVirtuals();
