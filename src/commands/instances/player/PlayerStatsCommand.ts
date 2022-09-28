import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, Renderable } from '../../../types';
import { encodeURL, round, SKILLS, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';
import womClient from '../../../api/wom-api';

const RENDER_WIDTH = 215;
const RENDER_HEIGHT = 260;
const RENDER_PADDING = 15;

enum RenderVariant {
  Levels = 'Levels',
  Ranks = 'Ranks',
  Experience = 'Experience',
  EHP = 'EHP'
}

class PlayerStatsCommand implements Command, Renderable {
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
            ['Levels', RenderVariant.Levels],
            ['Ranks', RenderVariant.Ranks],
            ['Experience', RenderVariant.Experience],
            ['Efficient Hours Played', RenderVariant.EHP]
          ])
      )
      .addStringOption(option => option.setName('username').setDescription('In-game username'))
      .setName('stats')
      .setDescription('View player stats');
  }

  async execute(message: CommandInteraction) {
    await message.deferReply();

    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    const variant = message.options.getString('variant') as RenderVariant;

    if (!username) {
      throw new CommandError(
        'This commands requires a username. Set a default by using the `setrsn` command.'
      );
    }

    try {
      const player = await womClient.players.getPlayerDetails({ username });
      const { attachment, fileName } = await this.render({
        skills: player.latestSnapshot.data.skills,
        username: player.username,
        variant
      });

      const embed = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
        .setTitle(`${player.displayName} (Combat ${player.combatLevel}) - ${variant}`)
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
    skills: any;
    username: string;
    variant: RenderVariant;
  }): Promise<CanvasAttachment> {
    const { skills, username, variant } = props;

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player stats
    for (const [index, skill] of Object.keys(skills)
      .sort((a, b) => SKILLS.indexOf(a) - SKILLS.indexOf(b))
      .entries()) {
      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${skill}.png`);

      // Badge background and skill icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX + 1, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = '#ffffff';

      if (variant === RenderVariant.Levels) {
        ctx.font = '11px sans-serif';

        const level = `${skills[skill].level || 1}`;
        const lvlWidth = ctx.measureText(level).width;

        // Skill level
        ctx.fillText(level, originX + 42 - lvlWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Experience) {
        const fontSize = skill === 'overall' ? 9 : 10;
        ctx.font = `${fontSize}px sans-serif`;

        const exp = `${toKMB(skills[skill].experience, 1) || 0}`;
        const expWidth = ctx.measureText(exp).width;

        // Skill Experience
        ctx.fillText(exp, originX + 44 - expWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Ranks) {
        ctx.font = '10px sans-serif';

        const rank = `${toKMB(skills[skill].rank, 1) || 0}`;
        const rankWidth = ctx.measureText(rank).width;

        // Skill Rank
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHP) {
        ctx.font = '9px sans-serif';

        const ehp = `${round(skills[skill].ehp || 0, 1)}`;
        const ehpWidth = ctx.measureText(ehp).width;

        // Skill EHP
        ctx.fillText(ehp, originX + 44 - ehpWidth / 2, originY + 16);
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
      case 'exp':
        return RenderVariant.Experience;
      case 'ranks':
        return RenderVariant.Ranks;
      case 'ehp':
        return RenderVariant.EHP;
      default:
        return RenderVariant.Levels;
    }
  }
}

export default new PlayerStatsCommand();
