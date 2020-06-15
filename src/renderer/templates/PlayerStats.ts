import Canvas from 'canvas';
import { MessageAttachment } from 'discord.js';
import { GraphicTemplate, MetricType, Player, SkillResult } from '../../types';
import { toResults } from '../../utils';

const SCALE_FACTOR = 1;
const WIDTH = 337 * SCALE_FACTOR;
const HEIGHT = 315 * SCALE_FACTOR;
const PADDING = 15;

class PlayerStatsTemplate implements GraphicTemplate {
  name: string;

  constructor() {
    this.name = 'Player Stats Template';
  }

  async render(props: Player): Promise<MessageAttachment> {
    // Convert the snapshot into skill results
    const skillResults = <SkillResult[]>toResults(props.latestSnapshot, MetricType.Skill);

    const imgName = 'test.png';

    const playerTypeIcon = await Canvas.loadImage(`./public/${props.type}.png`);
    const badge = await Canvas.loadImage(`./public/badge-bg.png`);

    const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

    // Background fill
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Player type icon
    ctx.drawImage(playerTypeIcon, PADDING, PADDING + 2);

    // Player name
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(props.displayName, PADDING + 20, PADDING + 15);

    // Player combat
    const nameWidth = ctx.measureText(props.displayName).width;
    ctx.font = '14px Arial';
    ctx.fillStyle = '#909090';
    ctx.fillText(`(Combat lvl. ${props.combatLevel})`, nameWidth + PADDING + 30, PADDING + 14);

    // await Promise.all(
    skillResults.forEach((skill, index) => {
      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = PADDING - 7 + x * 107;
      const originY = PADDING + 25 + y * 33;

      // const icon = Canvas.loadImage(`./public/${skill}.png`);

      ctx.drawImage(badge, originX, originY);
    });
    // );

    return new MessageAttachment(canvas.toBuffer(), imgName);
  }
}

export default new PlayerStatsTemplate();
