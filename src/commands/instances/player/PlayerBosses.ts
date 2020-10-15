import Canvas from 'canvas';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { BossResult, MetricType, Player } from '../../../api/types';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, ParsedMessage, Renderable } from '../../../types';
import { encodeURL, round, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';

const RENDER_WIDTH = 282;
const RENDER_HEIGHT = 355;
const RENDER_PADDING = 15;

enum RenderVariant {
  Kills = 'Kills',
  Ranks = 'Ranks',
  EHB = 'EHB'
}

class PlayerBosses implements Command, Renderable {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player bosses';
    this.template = '!bosses {username} [--ranks/--ehb]';
  }

  activated(message: ParsedMessage) {
    return message.command === 'bosses';
  }

  async execute(message: ParsedMessage) {
    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    // Grab (if it exists) the command variant from the command's arguments (--exp / --ranks)
    const variant = this.getRenderVariant(message.args);

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
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/overview/bossing`))
        .setTitle(`${player.displayName} - Boss ${variant}`)
        .setImage(`attachment://${fileName}`)
        .setFooter('Last updated')
        .setTimestamp(player.updatedAt)
        .attachFiles([attachment]);

      message.respond(embed);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async render(props: { player: Player; variant: RenderVariant }): Promise<CanvasAttachment> {
    const { player, variant } = props;

    // Convert the snapshot into boss results
    const bossResults = <BossResult[]>toResults(player.latestSnapshot, MetricType.Boss);

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player stats
    for (const [index, result] of bossResults.entries()) {
      const x = Math.floor(index / 11);
      const y = index % 11;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${result.name}.png`);

      // Badge background and boss icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX, originY - 1, icon.width / 2, icon.height / 2);

      const isRanked = result.kills && result.kills > -1;

      if (variant === RenderVariant.Kills) {
        ctx.font = '11px Arial';

        const kills = `${isRanked ? (result.kills >= 10000 ? toKMB(result.kills) : result.kills) : '?'}`;
        const killsWidth = ctx.measureText(kills).width;

        // Boss kills
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(kills, originX + 42 - killsWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Ranks) {
        ctx.font = '10px Arial';

        const rank = `${isRanked ? toKMB(result.rank, 1) : '?'}`;
        const rankWidth = ctx.measureText(rank).width;

        // Boss rank
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHB) {
        ctx.font = '10px Arial';

        const ehb = `${round(result.ehb, 1)}`;
        const ehbWidth = ctx.measureText(ehb).width;

        // Boss EHB
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(ehb, originX + 44 - ehbWidth / 2, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${player.username.replace(/ /g, '_')}-${variant}.jpeg`;
    const attachment = new MessageAttachment(canvas.toBuffer(), fileName);

    return { attachment, fileName };
  }

  async getUsername(message: ParsedMessage): Promise<string | undefined | null> {
    const explicitUsername = message.args.filter(a => !a.startsWith('--')).join(' ');

    if (explicitUsername) {
      return explicitUsername;
    }

    const inferedUsername = await getUsername(message.sourceMessage.author.id);

    return inferedUsername;
  }

  getRenderVariant(args: string[]): RenderVariant {
    if (!args || args.length === 0) {
      return RenderVariant.Kills;
    }

    const variantArg = args.find(a => a.startsWith('--'));

    if (!variantArg) {
      return RenderVariant.Kills;
    }

    if (variantArg === '--rank' || variantArg === '--ranks') {
      return RenderVariant.Ranks;
    }

    if (variantArg === '--ehb' || variantArg === '--hours') {
      return RenderVariant.EHB;
    }

    return RenderVariant.Kills;
  }
}

export default new PlayerBosses();
