import { CommandInteraction, MessageEmbed, Constants } from 'discord.js';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import {
  GetPlayerGainsResponse,
  PlayerDeltasMap,
  getMetricName,
  formatNumber,
  Metric
} from '@wise-old-man/utils';
import config from '../../../config';
import { encodeURL, getEmoji } from '../../../utils';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig } from '../../../commands/utils/commands';
import { getUsernameParam } from '../../../utils/wooow';
import { CommandError, ErrorCode } from '../../../utils/error';

const GAINS_PER_PAGE = 10;

const CONFIG: CommandConfig = {
  name: 'gained',
  description: "View a player's gains.",
  options: [
    {
      type: 'string',
      name: 'period',
      description: 'Tip: You can use custom periods using the following format: 1y6d5h',
      required: true,
      autocomplete: true
    },
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.'
    }
  ]
};

class PlayerGainedCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    // Grab the period from the command's arguments
    const period = interaction.options.getString('period', true);

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        ErrorCode.PLAYER_NOT_FOUND,
        "Player not found. Possibly hasn't been tracked yet on WiseOldMan.",
        'Tip: Try tracking them first using the /update command'
      );
    });

    const playerGains = await womClient.players.getPlayerGains(username, { period });

    if (!playerGains || !playerGains.startsAt || !playerGains.endsAt) {
      throw new Error(`${player.displayName} has no ${period} gains.`);
    }

    const pages = buildPages(player.displayName, period, playerGains);
    const footer = `Tip: You can use custom periods with this format: /gained period: 2m6d7h`;

    if (pages.length === 1) {
      const response = pages[0]
        .setColor(config.visuals.blue)
        .setTitle(`${player.displayName} gains (${period})`)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/gained/`))
        .setFooter({ text: footer });

      await interaction.editReply({ embeds: [response] });
      return;
    }

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

    paginatedMessage.idle = 120000;
    paginatedMessage.run(interaction);
  }
}

function buildPages(
  displayName: string,
  period: string,
  gained: GetPlayerGainsResponse<PlayerDeltasMap>
) {
  const gainsList = buildGainsList(displayName, period, gained);
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

function buildGainsList(
  displayName: string,
  period: string,
  gained: GetPlayerGainsResponse<PlayerDeltasMap>
) {
  const computedGains = Array.from(Object.entries(gained.data.computed))
    .filter(([, e]) => e.value.gained > 0)
    .map(([key, val]) => ({ metric: key, gained: val.value.gained }))
    .sort((a, b) => b.gained - a.gained);

  const skillGains = Array.from(Object.entries(gained.data.skills))
    .filter(([, e]) => e.experience.gained > 0)
    .map(([key, val]) => ({ metric: key, gained: val.experience.gained }))
    .sort((a, b) => b.gained - a.gained);

  const bossGains = Array.from(Object.entries(gained.data.bosses))
    .filter(([, e]) => e.kills.gained > 0)
    .map(([key, val]) => ({ metric: key, gained: val.kills.gained }))
    .sort((a, b) => b.gained - a.gained);

  const activityGains = Array.from(Object.entries(gained.data.activities))
    .filter(([, e]) => e && e.score.gained > 0)
    .map(([key, val]) => ({ metric: key, gained: val?.score.gained || 0 }))
    .sort((a, b) => b.gained - a.gained);

  const valid = [...computedGains, ...skillGains, ...bossGains, ...activityGains];

  if (!valid || valid.length === 0) {
    throw new Error(`${displayName} has no ${period} gains.`);
  }

  return valid.map(({ metric, gained }) => {
    return `${getEmoji(metric)} ${getMetricName(metric as Metric)} - **${formatNumber(gained, true)}**`;
  });
}

export default new PlayerGainedCommand();
