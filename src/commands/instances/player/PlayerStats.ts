import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { fetchPlayer } from '../../../api/modules/players';
import { toResults } from '../../../api/modules/snapshots';
import { MetricType, Player, SkillResult } from '../../../api/types';
import config from '../../../config';
import { getUsername } from '../../../database/services/alias';
import { CanvasAttachment, Command, Renderable } from '../../../types';
import { encodeURL, round, SKILLS, toKMB } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import CommandError from '../../CommandError';

const RENDER_WIDTH = 215;
const RENDER_HEIGHT = 260;
const RENDER_PADDING = 15;

enum RenderVariant {
  Levels = 'Levels',
  Ranks = 'Ranks',
  Experience = 'Experience',
  EHP = 'EHP'
}

class PlayerStats implements Command, Renderable {
  slashCommand: SlashCommandBuilder;
  global: boolean;

  constructor() {
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
    this.global = true;
  }

  async execute(message: CommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await this.getUsername(message);

    const variant = message.options.getString('variant') as RenderVariant;

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
        .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
        .setTitle(`${player.displayName} (Combat ${player.combatLevel}) - ${variant}`)
        .setImage(`attachment://${fileName}`)
        .setFooter({ text: 'Last updated' })
        .setTimestamp(player.updatedAt);

      message.reply({ embeds: [embed], files: [attachment] });
    } catch (e: any) {
      const errorMessage = `**${username}** is not being tracked yet.`;
      const errorTip = `Try /update ${username}`;

      throw new CommandError(errorMessage, errorTip);
    }
  }

  async render(props: { player: Player; variant: RenderVariant }): Promise<CanvasAttachment> {
    const { player, variant } = props;

    // Convert the snapshot into skill results
    // Sort them by the skill's name (to match the ingame stats interface)
    const skillResults = <SkillResult[]>(
      toResults(player.latestSnapshot, MetricType.Skill).sort(
        (a, b) => SKILLS.indexOf(a.name) - SKILLS.indexOf(b.name)
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
    for (const [index, result] of skillResults.entries()) {
      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${result.name}.png`);

      // Badge background and skill icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX + 1, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = '#ffffff';

      if (variant === RenderVariant.Levels) {
        ctx.font = '11px sans-serif';

        const level = `${result.level || 1}`;
        const lvlWidth = ctx.measureText(level).width;

        // Skill level
        ctx.fillText(level, originX + 42 - lvlWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Experience) {
        const fontSize = result.name === 'overall' ? 9 : 10;
        ctx.font = `${fontSize}px sans-serif`;

        const exp = `${toKMB(result.experience, 1) || 0}`;
        const expWidth = ctx.measureText(exp).width;

        // Skill Experience
        ctx.fillText(exp, originX + 44 - expWidth / 2, originY + 17);
      } else if (variant === RenderVariant.Ranks) {
        ctx.font = '10px sans-serif';

        const rank = `${toKMB(result.rank, 1) || 0}`;
        const rankWidth = ctx.measureText(rank).width;

        // Skill Rank
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHP) {
        ctx.font = '9px sans-serif';

        const ehp = `${round(result.ehp || 0, 1)}`;
        const ehpWidth = ctx.measureText(ehp).width;

        // Skill EHP
        ctx.fillText(ehp, originX + 44 - ehpWidth / 2, originY + 16);
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

export default new PlayerStats();
