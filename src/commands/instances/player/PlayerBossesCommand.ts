import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatNumber, round } from '@wise-old-man/utils';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, Renderable } from '../../../types';
import { encodeURL } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

const RENDER_WIDTH = 350;
const RENDER_HEIGHT = 355;
const RENDER_PADDING = 15;

enum RenderVariant {
  Kills = 'Kills',
  Ranks = 'Ranks',
  EHB = 'EHB'
}

class PlayerBossesCommand implements Command, Renderable {
  global: boolean;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option =>
        option
          .setName('variant')
          .setDescription('The variant to show stats for')
          .setRequired(true)
          .addChoices([
            ['Kill Counts', RenderVariant.Kills],
            ['Ranks', RenderVariant.Ranks],
            ['Efficient Hours Bossed', RenderVariant.EHB]
          ])
      )
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('bosses')
      .setDescription('View player bosses');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);
    const variant = message.options.getString('variant', true) as RenderVariant;

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const player = await womClient.players.getPlayerDetails({ username });

      const { attachment, fileName } = await this.render({
        bosses: player.latestSnapshot.data.bosses,
        computed: player.latestSnapshot.data.computed,
        username: player.username,
        variant
      });

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/overview/bossing`))
        .setTitle(`${player.displayName} - Boss ${variant}`)
        .setImage(`attachment://${fileName}`)
        .setFooter({ text: 'Last updated' })
        .setTimestamp(player.updatedAt);

      await message.editReply({ embeds: [embed], files: [attachment] });
    } catch (e: any) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try /update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async render(props: {
    bosses: any;
    computed: any;
    username: string;
    variant: RenderVariant;
  }): Promise<CanvasAttachment> {
    const { bosses, computed, username, variant } = props;

    bosses['ehb'] = {
      metric: 'ehb',
      kills: Math.floor(computed['ehb'].value),
      rank: computed['ehb'].rank,
      ehb: computed['ehb'].value
    };

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player bosses
    for (const [index, boss] of Object.keys(bosses).entries()) {
      const x = Math.floor(index / 11);
      const y = index % 11;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${boss}.png`);

      // Badge background and boss icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX, originY - 1, icon.width / 2, icon.height / 2);

      const isRanked = bosses[boss].kills && bosses[boss].kills > -1;

      if (variant === RenderVariant.Kills) {
        ctx.font = '11px Arial';

        const kills = `${
          isRanked
            ? bosses[boss].kills >= 10000
              ? formatNumber(bosses[boss].kills, true)
              : bosses[boss].kills
            : '?'
        }`;
        const killsWidth = ctx.measureText(kills).width;

        // Boss kills
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(kills, originX + 42 - killsWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Ranks) {
        ctx.font = '10px Arial';

        const rank = `${isRanked ? formatNumber(bosses[boss].rank, true) : '?'}`; // TODO: decimalPrecision = 1
        const rankWidth = ctx.measureText(rank).width;

        // Boss rank
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHB) {
        ctx.font = '10px Arial';

        const ehb = `${round(bosses[boss].ehb, 1)}`;
        const ehbWidth = ctx.measureText(ehb).width;

        // Boss EHB
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(ehb, originX + 44 - ehbWidth / 2, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${username.replace(/ /g, '_')}-${variant}.jpeg`;
    const attachment = new MessageAttachment(canvas.toBuffer(), fileName);

    return { attachment, fileName };
  }

  async getUsername(message: CommandInteraction): Promise<string | undefined | null> {
    const username = message.options.getString('username', false);
    if (username) return username;

    const inferredUsername = await getUsername(message.user.id);
    return inferredUsername;
  }

  getRenderVariant(subCommand: string): RenderVariant {
    switch (subCommand) {
      case 'ranks':
        return RenderVariant.Ranks;
      case 'ehb':
        return RenderVariant.EHB;
      default:
        return RenderVariant.Kills;
    }
  }
}

export default new PlayerBossesCommand();
