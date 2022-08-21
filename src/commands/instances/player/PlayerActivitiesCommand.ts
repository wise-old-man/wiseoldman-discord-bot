import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { ActivityResult, MetricType, Player } from '../../../api/types';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, Renderable } from '../../../types';
import { ACTIVITIES, encodeURL, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';

const RENDER_WIDTH = 357;
const RENDER_HEIGHT = 100;
const RENDER_PADDING = 15;

enum RenderVariant {
  Scores = 'Scores',
  Ranks = 'Ranks'
}

class PlayerActivitiesCommand implements Command, Renderable {
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
            ['Scores', RenderVariant.Scores],
            ['Ranks', RenderVariant.Ranks]
          ])
      )
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('activities')
      .setDescription('View player activity score');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    // Get the variant from subcommand
    const variant = message.options.getString('variant', true) as RenderVariant;

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const player = await fetchPlayer(username);

      const { attachment, fileName } = await this.render({ player, variant });

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/overview/activities`))
        .setTitle(`${player.displayName} - Activity ${variant}`)
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

  async render(props: { player: Player; variant: RenderVariant }): Promise<CanvasAttachment> {
    const { player, variant } = props;

    // Convert the snapshot into activity results
    const activityResults = <ActivityResult[]>(
      toResults(player.latestSnapshot, MetricType.Activity).sort(
        (a, b) => ACTIVITIES.indexOf(a.name) - ACTIVITIES.indexOf(b.name)
      )
    );

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player stats
    for (const [index, result] of activityResults.entries()) {
      const x = Math.floor(index / 3);
      const y = index % 3;

      const originX = RENDER_PADDING - 7 + x * 69;
      const originY = RENDER_PADDING - 8 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${result.name}.png`);

      // Badge background and activity icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX, originY, icon.width / 2, icon.height / 2);

      const isRanked = result.score && result.score > -1;

      if (variant === RenderVariant.Scores) {
        ctx.font = '11px Arial';

        const score = `${isRanked ? (result.score >= 10000 ? toKMB(result.score) : result.score) : '?'}`;
        const scoreWidth = ctx.measureText(score).width;

        // Activity score
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(score, originX + 42 - scoreWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Ranks) {
        ctx.font = '10px Arial';

        const rank = `${isRanked ? toKMB(result.rank, 1) : '?'}`;
        const rankWidth = ctx.measureText(rank).width;

        // Activity rank
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${player.username.replace(/ /g, '_')}-${variant}.jpeg`;
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
      default:
        return RenderVariant.Scores;
    }
  }
}

export default new PlayerActivitiesCommand();
