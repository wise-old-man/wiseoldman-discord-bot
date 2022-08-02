import { MessageEmbed, Constants } from 'discord.js';
import { fetchPlayer, fetchPlayerGains } from '../../../api/modules/players';
import { PlayerGains } from '../../../api/types';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { Command, ParsedMessage } from '../../../types';
import { encodeURL, getEmoji, getMetricName, toKMB } from '../../../utils';
import CommandError from '../../CommandError';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';

const GAINS_PER_PAGE = 10;

class PlayerGained implements Command {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player gains';
    this.template = '!gained {username} [--6h/--day/--week/--month/--year/--1y6d5h]';
  }

  activated(message: ParsedMessage) {
    return message.command === 'gained';
  }

  async execute(message: ParsedMessage) {
    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    // Grab the period from the command's arguments
    const period = this.getPeriodArg(message.args);

    const footer = `Tip: You can use custom periods with this format: ${message.prefix}gained --2m6d7h`;

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

      if (pages.length === 1) {
        const response = pages[0]
          .setColor(config.visuals.blue)
          .setTitle(`${player.displayName} gains (${period})`)
          .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/gained/`))
          .setFooter({ text: footer });

        message.respond({ embeds: [response] });
      } else {
        const paginatedMessage = new PaginatedMessage({
          pageIndexPrefix: 'Page',
          embedFooterSeparator: '|',
          actions: [
            {
              customId: 'CustomPreviousAction',
              type: Constants.MessageComponentTypes.BUTTON,
              style: 'PRIMARY',
              label: '<',
              run: ({ handler }) => {
                if (handler.index === 0) handler.index = handler.pages.length - 1;
                else --handler.index;
              }
            },
            {
              customId: 'CustomNextAction',
              type: Constants.MessageComponentTypes.BUTTON,
              style: 'PRIMARY',
              label: '>',
              run: ({ handler }) => {
                if (handler.index === handler.pages.length - 1) handler.index = 0;
                else ++handler.index;
              }
            }
          ],
          template: new MessageEmbed()
            .setColor(config.visuals.blue)
            .setTitle(`${player.displayName} gains (${period})`)
            .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/gained/`))
            .setFooter({ text: footer })
        });

        for (const page of pages) {
          paginatedMessage.addPageEmbed(page);
        }

        paginatedMessage.idle = 30000;
        paginatedMessage.run(message.sourceMessage);
      }
    } catch (e: any) {
      if (e.message.includes('gains')) {
        throw new CommandError(e.message);
      } else {
        if (e.response?.data?.message.includes('tracked')) {
          const errorMessage = `**${username}** is not being tracked yet.`;
          const errorTip = `Try ${message.prefix}update ${username}`;

          throw new CommandError(errorMessage, errorTip);
        } else {
          throw new CommandError(e.response?.data?.message);
        }
      }
    }
  }

  buildPages(displayName: string, period: string, gained: PlayerGains) {
    const gainsList = this.buildGainsList(displayName, period, gained);
    const pageCount = Math.ceil(gainsList.length / GAINS_PER_PAGE);

    if (pageCount === 0) {
      throw new Error(`${displayName} has no ${period} gains.`);
    }

    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      const pageGains = gainsList.slice(i * GAINS_PER_PAGE, i * GAINS_PER_PAGE + GAINS_PER_PAGE);
      pages.push(
        new MessageEmbed()
          .setTitle(`${displayName} gains (${period})`)
          .setDescription(pageGains.join('\n'))
      );
    }

    return pages;
  }

  buildGainsList(displayName: string, period: string, gained: PlayerGains) {
    const gainedArray = Array.from(Object.entries(gained.data));

    const virtualGains = gainedArray
      .filter(([, e]) => e.value && e.value.gained > 0)
      .map(([key, val]) => ({ metric: key, gained: val.value?.gained || 0 }))
      .sort((a: any, b: any) => b.gained - a.gained);

    const skillGains = gainedArray
      .filter(([, e]) => e.experience && e.experience.gained > 0)
      .map(([key, val]) => ({ metric: key, gained: val.experience?.gained || 0 }))
      .sort((a: any, b: any) => b.gained - a.gained);

    const bossGains = gainedArray
      .filter(([, e]) => e.kills && e.kills.gained > 0)
      .map(([key, val]) => ({ metric: key, gained: val.kills?.gained || 0 }))
      .sort((a: any, b: any) => b.gained - a.gained);

    const activityGains = gainedArray
      .filter(([, e]) => e.score && e.score.gained > 0)
      .map(([key, val]) => ({ metric: key, gained: val.score?.gained || 0 }))
      .sort((a: any, b: any) => b.gained - a.gained);

    const valid = [...virtualGains, ...skillGains, ...bossGains, ...activityGains];

    if (!valid || valid.length === 0) {
      throw new Error(`${displayName} has no ${period} gains.`);
    }

    return valid.map(({ metric, gained }) => {
      return `${getEmoji(metric)} ${getMetricName(metric)} - **${toKMB(gained)}**`;
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
