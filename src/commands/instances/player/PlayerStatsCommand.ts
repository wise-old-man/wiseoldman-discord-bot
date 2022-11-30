import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { formatNumber, isSkill, PlayerDetails, round } from '@wise-old-man/utils';
import config from '../../../config';
import { encodeURL, INGAME_SKILL_ORDER } from '../../../utils';
import { getScaledCanvas } from '../../../utils/rendering';
import womClient from '../../../services/wiseoldman';
import { getUsernameParam } from '../../../utils/wooow';
import { Command, CommandConfig } from '../../../commands/utils/commands';
import { CommandError, ErrorCode } from '../../../utils/error';

const RENDER_WIDTH = 215;
const RENDER_HEIGHT = 260;
const RENDER_PADDING = 15;

enum RenderVariant {
  LEVELS = 'levels',
  RANKS = 'ranks',
  EXPERIENCE = 'experience',
  EHP = 'ehp'
}

const CONFIG: CommandConfig = {
  name: 'stats',
  description: "View a player's skilling stats.",
  options: [
    {
      type: 'string',
      name: 'variant',
      description: 'The variant to show stats for (levels / exp / rank / ehp).',
      required: true,
      choices: [
        { label: 'Levels', value: RenderVariant.LEVELS },
        { label: 'Ranks', value: RenderVariant.RANKS },
        { label: 'Experience', value: RenderVariant.EXPERIENCE },
        { label: 'Efficient Hours Played', value: RenderVariant.EHP }
      ]
    },
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.'
    }
  ]
};

class PlayerStatsCommand extends Command {
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
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setTitle(`${player.displayName} (Combat ${player.combatLevel}) - ${variant}`)
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: 'Last updated' })
      .setTimestamp(player.updatedAt);

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }

  async render(playerDetails: PlayerDetails, variant: RenderVariant) {
    const username = playerDetails.username;
    const skills = playerDetails.latestSnapshot.data.skills;

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    // Player stats
    for (const [index, skill] of Object.keys(skills)
      .sort((a, b) => INGAME_SKILL_ORDER.indexOf(a) - INGAME_SKILL_ORDER.indexOf(b))
      .entries()) {
      if (!isSkill(skill)) continue;

      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${skill}.png`);

      // Badge background and skill icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX + 1, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = '#ffffff';

      if (variant === RenderVariant.LEVELS) {
        ctx.font = '11px sans-serif';

        const level = `${skills[skill].level || 1}`;
        const lvlWidth = ctx.measureText(level).width;

        // Skill level
        ctx.fillText(level, originX + 42 - lvlWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EXPERIENCE) {
        const fontSize = skill === 'overall' ? 9 : 10;
        ctx.font = `${fontSize}px sans-serif`;

        const exp = `${formatNumber(skills[skill].experience, true, 1) || 0}`;
        const expWidth = ctx.measureText(exp).width;

        // Skill Experience
        ctx.fillText(exp, originX + 44 - expWidth / 2, originY + 17);
      } else if (variant === RenderVariant.RANKS) {
        ctx.font = '10px sans-serif';

        const rank = `${formatNumber(skills[skill].rank, true, 1) || 0}`;
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
}

export default new PlayerStatsCommand();
