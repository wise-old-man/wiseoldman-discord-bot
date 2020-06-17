import Canvas from 'canvas';
import { MessageAttachment } from 'discord.js';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { MetricType, Player, SkillResult } from '../../../api/types';
import { Command, ParsedMessage, Renderable } from '../../../types';
import { durationSince, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';

const RENDER_WIDTH = 365;
const RENDER_HEIGHT = 310;
const RENDER_PADDING = 15;

class StatsCommand implements Command, Renderable {
  name: string;
  template: string;

  constructor() {
    this.name = 'View player stats';
    this.template = '!stats {username}';
  }

  activated(message: ParsedMessage) {
    return message.command === 'stats';
  }

  async execute(message: ParsedMessage) {
    const username = message.args.join(' ');

    try {
      const player = await fetchPlayer(username);
      const image = await this.render(player);

      message.respond(image);
    } catch (e) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try !update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async render(props: Player): Promise<MessageAttachment> {
    // Convert the snapshot into skill results
    const skillResults = <SkillResult[]>toResults(props.latestSnapshot, MetricType.Skill);
    const updatedAgo = durationSince(props.updatedAt, 2);

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const playerTypeIcon = await Canvas.loadImage(`./public/${props.type}.png`);
    const badge = await Canvas.loadImage(`./public/badge-bg.png`);

    // Background fill
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, width, height);

    // Player type icon
    ctx.drawImage(playerTypeIcon, RENDER_PADDING, RENDER_PADDING + 2);

    // Player name
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(props.displayName, RENDER_PADDING + 20, RENDER_PADDING + 15);

    // Player combat
    const nameWidth = ctx.measureText(props.displayName).width;
    const combatLabel = `(Combat lvl. ${props.combatLevel})`;

    ctx.font = '14px Arial';
    ctx.fillStyle = '#909090';
    ctx.fillText(combatLabel, nameWidth + RENDER_PADDING + 30, RENDER_PADDING + 14);

    // Player stats
    for (const [index, result] of skillResults.entries()) {
      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 10 + x * 115;
      const originY = RENDER_PADDING + 25 + y * 28;

      const icon = await Canvas.loadImage(`./public/${result.name}.png`);
      const level = `${result.level || 0}`;
      const exp = `${toKMB(result.experience) || 0}`;

      // Badge background and skill icon
      ctx.drawImage(badge, originX, originY, 127, 38);
      ctx.drawImage(icon, originX + 13, originY + 11, 16, 16);

      // Skill level
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(level, originX + 35, originY + 23);

      const levelWidth = ctx.measureText(level).width;

      // Skill Exp.
      ctx.font = '11px Arial';
      ctx.fillStyle = '#909090';
      ctx.fillText(`(${exp})`, originX + 40 + levelWidth, originY + 23);
    }

    // Player updated ago
    const updatedAgoLabel = `Updated ${updatedAgo} ago`;
    const updatedAgoWidth = ctx.measureText(updatedAgoLabel).width;

    ctx.font = '12px Arial';
    ctx.fillStyle = '#909090';
    ctx.fillText(
      updatedAgoLabel,
      RENDER_WIDTH / 2 - updatedAgoWidth / 2 - RENDER_PADDING / 2,
      RENDER_PADDING + 278
    );

    return new MessageAttachment(canvas.toBuffer());
  }
}

export default new StatsCommand();
