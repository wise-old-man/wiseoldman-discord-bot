import { Embeds } from 'discord-paginationembed';
import { MessageEmbed } from 'discord.js';
import { map } from 'lodash';
import { fetchPlayer, fetchPlayerGains } from '../../../api/modules/players';
import { PlayerGains } from '../../../api/types';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';

const GAINS_PER_PAGE = 10;

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
    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    // Grab the period from the command's arguments
    const period = this.getPeriodArg(message.args);

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const player = await fetchPlayer(username);
      const playerGains = await fetchPlayerGains(username, period);

      if (!playerGains || !playerGains.startsAt || !playerGains.endsAt) {
        throw new Error(`${player.displayName} has no ${period} gains.`);
      }

      const pages = this.buildPages(player.displayName, period, playerGains);

      new Embeds()
        .setArray(pages)
        .setChannel(<any>message.sourceMessage.channel)
        .setPageIndicator(true)
        .setColor(config.visuals.blue)
        .setTitle(`${player.displayName} gains (${period})`)
        .setURL(`https://wiseoldman.net/players/${player.id}/gained/`)
        .build();
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

  buildPages(displayName: string, period: string, gained: PlayerGains) {
    const gainsList = this.buildGainsList(period, gained);
    const pageCount = Math.ceil(gainsList.length / GAINS_PER_PAGE);

    if (pageCount === 0) {
      throw new Error(`${displayName} has no ${period} gains.`);
    }

    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      const pageGains = gainsList.slice(i * GAINS_PER_PAGE, i * GAINS_PER_PAGE + GAINS_PER_PAGE);
      pages.push(new MessageEmbed().setDescription(pageGains));
    }

    return pages;
  }

  buildGainsList(period: string, gained: PlayerGains) {
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

    return valid.map(g => {
      if (!g) return '';
      return `${getEmoji(g.metric)} ${getMetricName(g.metric)} - **${toKMB(g.gained)}**`;
    });
  }

  async getUsername(message: ParsedMessage): Promise<string | undefined | null> {
    const explicitUsername = message.args.filter(a => !a.startsWith('--')).join(' ');

    if (explicitUsername) {
      return explicitUsername;
    }

    const inferedUsername = await getUsername(message.sourceMessage.author.id);

    return inferedUsername;
  }

  getPeriodArg(args: string[]): string {
    return args.find(a => a.startsWith('--'))?.replace('--', '') || 'week';
  }
}

export default new PlayerGained();
