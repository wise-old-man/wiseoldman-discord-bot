import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, Renderable } from '../../../types';
import { encodeURL, formatDate } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

const RENDER_WIDTH = 280;
const RENDER_HEIGHT = 165;
const RENDER_PADDING = 15;

class PlayerAchievementsCommand implements Command, Renderable {
  global: boolean;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.global = true;
    this.slashCommand = new SlashCommandBuilder()
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('achievements')
      .setDescription('View player recent achievements');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const player = await womClient.players.getPlayerDetails({ username });
      const data = await womClient.players.getPlayerAchievements({ username });

      if (!data || data.length === 0) {
        throw new Error(`${player.displayName} has no achievements.`);
      }

      const achievements = data
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      const { attachment, fileName } = await this.render({ player, achievements });

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/achievements/`))
        .setTitle(`${player.displayName} - Recent achievements`)
        .setImage(`attachment://${fileName}`)
        .setFooter({ text: 'Last updated' })
        .setTimestamp(player.updatedAt);

      await message.editReply({ embeds: [embed], files: [attachment] });
    } catch (e: any) {
      if (e.message.includes('achievements')) {
        throw new CommandError(e.message);
      } else {
        const errorMessage = `**${username}** is not being tracked yet.`;
        const errorTip = `Try /update ${username}`;

        throw new CommandError(errorMessage, errorTip);
      }
    }
  }

  async render(props: any): Promise<CanvasAttachment> {
    const { player, achievements } = props;

    const calculatedHeight = Math.min(10 + achievements.length * 31, RENDER_HEIGHT);

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, calculatedHeight, 3);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge_long.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player achievements
    for (const [index, result] of achievements.entries()) {
      const originX = RENDER_PADDING - 7;
      const originY = RENDER_PADDING - 8 + index * 31;

      const icon = await Canvas.loadImage(`./public/x2/${result.metric}.png`);

      // Badge background and metric icon
      ctx.drawImage(badge, originX, originY, 199, 26);
      ctx.drawImage(icon, originX, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Arial';
      ctx.fillText(result.name, originX + 30, originY + 17);

      ctx.fillStyle = '#b3b3b3';

      if (result.createdAt.getFullYear() > 2000) {
        ctx.fillText(formatDate(result.createdAt, "Do MMM 'YY"), originX + 205, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${player.username.replace(/ /g, '_')}-achievements.jpeg`;
    const attachment = new MessageAttachment(canvas.toBuffer(), fileName);

    return { attachment, fileName };
  }

  async getUsername(message: CommandInteraction): Promise<string | undefined | null> {
    const username = message.options.getString('username', false);
    if (username) return username;

    const inferredUsername = await getUsername(message.user.id);
    return inferredUsername;
  }
}

export default new PlayerAchievementsCommand();
