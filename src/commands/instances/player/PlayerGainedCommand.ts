import {
  formatNumber,
  Metric,
  MetricProps,
  parsePeriodExpression,
  PeriodProps,
  PlayerDeltasMapResponse
} from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { createPaginatedEmbed } from '../../../commands/pagination';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import {
  Command,
  CommandConfig,
  CommandError,
  encodeURL,
  getEmoji,
  getUsernameParam
} from '../../../utils';

const GAINS_PER_PAGE = 10;

const CONFIG: CommandConfig = {
  name: 'gained',
  description: "View a player's gains.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'period',
      description: 'Tip: You can use custom periods using the following format: 1y6d5h',
      required: true,
      autocomplete: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username or discord tag.'
    }
  ]
};

class PlayerGainedCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    // Grab the period from the command's arguments
    const period = interaction.options.getString('period', true);

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    const playerGains = await womClient.players.getPlayerGains(username, { period }).catch(e => {
      throw new CommandError(`${e.message}`);
    });

    if (!playerGains || !playerGains.startsAt || !playerGains.endsAt) {
      throw new CommandError(
        `${player.displayName} has no "${
          period in PeriodProps ? PeriodProps[period].name : period
        }" gains.`
      );
    }

    const urlPeriod =
      period in PeriodProps
        ? `period=${period}`
        : `startDate=${new Date(
            Date.now() - parsePeriodExpression(period)!.durationMs
          ).toISOString()}&endDate=${new Date().toISOString()}`;

    const pages = buildPages(player.displayName, period, playerGains);
    const footer = `Tip: You can use custom periods with this format: /gained period: 2m6d7h`;

    if (pages.length === 1) {
      const response = pages[0]
        .setColor(config.visuals.blue)
        .setTitle(`${player.displayName} gains (${period})`)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/gained?${urlPeriod}`))
        .setFooter({ text: footer });

      await interaction.editReply({ embeds: [response] });
      return;
    }

    const embedTemplate = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`${player.displayName} gains (${period})`)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/gained?${urlPeriod}`))
      .setFooter({ text: footer });

    const paginatedMessage = createPaginatedEmbed(embedTemplate, 120_000);

    for (const page of pages) {
      paginatedMessage.addPageEmbed(page);
    }

    paginatedMessage.run(interaction);
  }
}

function buildPages(
  displayName: string,
  period: string,
  gained: {
    startsAt: Date | null;
    endsAt: Date | null;
    data: PlayerDeltasMapResponse;
  }
) {
  const gainsList = buildGainsList(displayName, period, gained);
  const pageCount = Math.ceil(gainsList.length / GAINS_PER_PAGE);

  if (pageCount === 0) {
    throw new CommandError(
      `${displayName} has no "${period in PeriodProps ? PeriodProps[period].name : period}" gains.`
    );
  }

  const pages: Array<EmbedBuilder> = [];

  for (let i = 0; i < pageCount; i++) {
    const pageGains = gainsList.slice(i * GAINS_PER_PAGE, i * GAINS_PER_PAGE + GAINS_PER_PAGE);
    pages.push(
      new EmbedBuilder()
        .setTitle(`${displayName} gains (${period})`)
        .setDescription(pageGains.join('\n'))
    );
  }

  return pages;
}

function buildGainsList(
  displayName: string,
  period: string,
  gained: {
    startsAt: Date | null;
    endsAt: Date | null;
    data: PlayerDeltasMapResponse;
  }
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
    throw new CommandError(
      `${displayName} has no "${period in PeriodProps ? PeriodProps[period].name : period}" gains.`
    );
  }

  return valid.map(({ metric, gained }) => {
    let metricName = '';

    try {
      metricName = MetricProps[metric as Metric].name;
    } catch (e) {
      metricName = metric;
    }

    return `${getEmoji(metric)} ${metricName} - **${formatNumber(gained, true)}**`;
  });
}

export default new PlayerGainedCommand();
