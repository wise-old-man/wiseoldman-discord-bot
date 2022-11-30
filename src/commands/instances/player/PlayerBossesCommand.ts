import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { formatNumber, isBoss, Metric, PlayerDetails, round } from '@wise-old-man/utils';
import config from '../../../config';
import { encodeURL } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig } from '../../../commands/utils/commands';
import { getUsernameParam } from '../../../utils/wooow';
import { CommandError, ErrorCode } from '../../../utils/error';

const RENDER_WIDTH = 350;
const RENDER_HEIGHT = 355;
const RENDER_PADDING = 15;

enum RenderVariant {
  KILLS = 'kills',
  RANKS = 'ranks',
  EHB = 'ehb'
}

const CONFIG: CommandConfig = {
  name: 'bosses',
  description: "View a player's bossing stats.",
  options: [
    {
      type: 'string',
      name: 'variant',
      description: 'The variant to show stats for (kills / rank / ehb).',
      required: true,
      choices: [
        { label: 'Kill Counts', value: RenderVariant.KILLS },
        { label: 'Ranks', value: RenderVariant.RANKS },
        { label: 'Efficient Hours Bossed', value: RenderVariant.EHB }
      ]
    },
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.'
    }
  ]
};

class PlayerBossesCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    // Get the variant from subcommand
    const variant = interaction.options.getString('variant', true) as RenderVariant;

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        ErrorCode.PLAYER_NOT_FOUND,
        "Player not found. Possibly hasn't been tracked yet on WiseOldMan.",
        'Tip: Try tracking them first using the /update command'
      );
    });

    const { attachment, fileName } = await this.render(player, variant);

    const embed = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/overview/bossing`))
      .setTitle(`${player.displayName} - Boss ${variant}`)
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: 'Last updated' })
      .setTimestamp(player.updatedAt);

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }

  async render(playerDetails: PlayerDetails, variant: RenderVariant) {
    const username = playerDetails.username;
    const { bosses, computed } = playerDetails.latestSnapshot.data;

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    async function renderMetricSlot(
      index: number,
      metric: Metric,
      value: number,
      rank: number,
      ehb?: number
    ) {
      const x = Math.floor(index / 11);
      const y = index % 11;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${metric}.png`);

      // Badge background and boss icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX, originY - 1, icon.width / 2, icon.height / 2);

      const isRanked = value > -1;

      if (variant === RenderVariant.KILLS) {
        ctx.font = '11px Arial';

        const killsLabel = `${isRanked ? formatNumber(value, true, 1) : '?'}`;
        const killsWidth = ctx.measureText(killsLabel).width;

        // Boss kills
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(killsLabel, originX + 42 - killsWidth / 2, originY + 17);
      } else if (variant === RenderVariant.RANKS) {
        ctx.font = '10px Arial';

        const rankLabel = `${isRanked ? formatNumber(rank, true, 1) : '?'}`;
        const rankWidth = ctx.measureText(rankLabel).width;

        // Boss rank
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(rankLabel, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHB) {
        ctx.font = '10px Arial';

        const ehbLabel = `${round(ehb ? ehb : 0, 1)}`;
        const ehbWidth = ctx.measureText(ehbLabel).width;

        // Boss EHB
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(ehbLabel, originX + 44 - ehbWidth / 2, originY + 17);
      }
    }

    // Player bosses
    for (const [index, boss] of Object.keys(bosses).entries()) {
      if (!isBoss(boss)) continue;

      await renderMetricSlot(index, boss, bosses[boss].kills, bosses[boss].rank, bosses[boss].ehb);
    }

    await renderMetricSlot(
      Object.keys(bosses).length,
      Metric.EHB,
      computed.ehb.value,
      computed.ehb.rank,
      computed.ehb.value
    );

    const fileName = `${Date.now()}-${username.replace(/ /g, '_')}-${variant}.jpeg`;
    const attachment = new MessageAttachment(canvas.toBuffer(), fileName);

    return { attachment, fileName };
  }
}

export default new PlayerBossesCommand();
