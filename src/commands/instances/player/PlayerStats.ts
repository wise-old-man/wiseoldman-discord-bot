import Canvas from 'canvas';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { MetricType, Player, SkillResult } from '../../../api/types';
import config from '../../../config';
import { CanvasAttachment, Command, ParsedMessage, Renderable } from '../../../types';
import { formatDate, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';

const RENDER_WIDTH = 215;
const RENDER_HEIGHT = 260;
const RENDER_PADDING = 15;

enum Variant {
  Levels = 'Levels',
  Ranks = 'Ranks',
  Experience = 'Experience'
}

class StatsCommand implements Command, Renderable {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player stats';
    this.template = '!stats {username} [--exp/--ranks]';
  }

  activated(message: ParsedMessage) {
    return message.command === 'stats';
  }

  async execute(message: ParsedMessage) {
    // Grab the username from the command's arguments
    const username = this.getUsername(message.args);

    // Grab (if it exists) the command variant from the command's arguments (--exp / --ranks)
    const variant = this.getRenderVariant(message.args);

    try {
      const player = await fetchPlayer(username);
      const url = `https://wiseoldman.net/players/${player.id}`;
      const updatedDate = `Last updated at ${formatDate(player.updatedAt)}`;

      const { attachment, fileName } = await this.render({ player, variant });

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(url)
        .setTitle(`${player.displayName} - ${variant}`)
        .setImage(`attachment://${fileName}`)
        .setFooter(updatedDate)
        .attachFiles([attachment]);

      message.respond(embed);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async render(props: { player: Player; variant: Variant }): Promise<CanvasAttachment> {
    const { player, variant } = props;

    // Convert the snapshot into skill results
    const skillResults = <SkillResult[]>toResults(player.latestSnapshot, MetricType.Skill);

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const skillBadge = await Canvas.loadImage(`./public/x2/skill_badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player stats
    for (const [index, result] of skillResults.entries()) {
      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${result.name}.png`);

      // Badge background and skill icon
      ctx.drawImage(skillBadge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX + 1, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = '#ffffff';

      if (variant === Variant.Levels) {
        ctx.font = 'bold 12px Arial';

        const level = `${result.level || 1}`;
        const lvlWidth = ctx.measureText(level).width;

        // Skill level
        ctx.fillText(level, originX + 42 - lvlWidth / 2, originY + 17);
      } else if (variant === Variant.Experience) {
        ctx.font = 'bold 10px Arial';

        const exp = `${toKMB(result.experience, 1) || 0}`;
        const expWidth = ctx.measureText(exp).width;

        // Skill Experience
        ctx.fillText(exp, originX + 43 - expWidth / 2, originY + 17);
      } else if (variant === Variant.Ranks) {
        ctx.font = 'bold 10px Arial';

        const rank = `${toKMB(result.rank, 1) || 0}`;
        const rankWidth = ctx.measureText(rank).width;

        // Skill Rank
        ctx.fillText(rank, originX + 43 - rankWidth / 2, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${player.username}-${variant}.jpeg`;
    const attachment = new MessageAttachment(canvas.toBuffer(), fileName);

    return { attachment, fileName };
  }

  getUsername(args: string[]): string {
    return args.filter(a => !a.startsWith('--')).join(' ');
  }

  getRenderVariant(args: string[]): Variant {
    if (!args || args.length === 0) {
      return Variant.Levels;
    }

    const variantArg = args.find(a => a.startsWith('--'));

    if (!variantArg) {
      return Variant.Levels;
    }

    if (variantArg === '--exp' || variantArg === '--xp') {
      return Variant.Experience;
    }

    if (variantArg === '--rank' || variantArg === '--ranks') {
      return Variant.Ranks;
    }

    return Variant.Levels;
  }
}

export default new StatsCommand();
