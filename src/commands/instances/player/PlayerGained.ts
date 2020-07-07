import { MessageEmbed } from 'discord.js';
import { map } from 'lodash';
import { fetchPlayer, fetchPlayerGains } from '../../../api/modules/players';
import { PlayerGains } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

class PlayerGained implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player gains';
    this.template = '!gained {username} [--day/--week/--month/--year]';
  }

  activated(message: ParsedMessage) {
    return message.command === 'gained' && message.args.length > 0;
  }

  async execute(message: ParsedMessage) {
    // Grab the username from the command's arguments
    const username = this.getUsername(message.args);

    // Grab
    const period = this.getPeriodArg(message.args);

    try {
      const player = await fetchPlayer(username);
      const gained = await fetchPlayerGains(username, period);

      if (!gained || !gained.startsAt || !gained.endsAt) {
        throw new Error(`${player.displayName} has no ${period} gains.`);
      }

      const gainsList = this.buildList(period, gained);

      if (gainsList.length === 0) {
        throw new Error(`${player.displayName} has no ${period} gains.`);
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(`${player.displayName} gains (${period})`)
        .setDescription(gainsList)
        .setURL(`https://wiseoldman.net/players/${player.id}/gained/`);

      message.respond(response);
    } catch (e) {
      if (e.message.includes('gains')) {
        throw new CommandError(e.message);
      } else {
        if (e.response?.data?.message.includes('tracked')) {
          const errorMessage = `**${username}** is not being tracked yet.`;
          const errorTip = `Try !update ${username}`;

          throw new CommandError(errorMessage, errorTip);
        } else {
          throw new CommandError(e.response?.data?.message);
        }
      }
    }
  }

  buildList(period: string, gained: PlayerGains) {
    // Ignore any skills/bosses/activities with "0" gained
    const valid = map(gained.data, (val, key) => {
      if (val.experience && val.experience.gained > 0) {
        return { metric: key, gained: val.experience.gained };
      }

      if (val.kills && val.kills.gained > 0) {
        return { metric: key, gained: val.kills.gained };
      }

      if (val.score && val.score.gained > 0) {
        return { metric: key, gained: val.score.gained };
      }

      return null;
    }).filter(v => v);

    if (!valid) {
      throw new Error(`No gains found for ${period}.`);
    }

    return valid
      .map(g => (!g ? '' : `${getEmoji(g.metric)} ${getMetricName(g.metric)} - **${toKMB(g.gained)}**`))
      .join('\n');
  }

  getUsername(args: string[]): string {
    return args.filter(a => !a.startsWith('--')).join(' ');
  }

  getPeriodArg(args: string[]): string {
    return args.find(a => a.startsWith('--'))?.replace('--', '') || 'week';
  }
}

export default new PlayerGained();
