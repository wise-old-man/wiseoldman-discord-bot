import { formatNumber, isSkill, Metric, PlayerDetails, round } from '@wise-old-man/utils';
import Canvas from 'canvas';
import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  ApplicationCommandOptionType
} from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import {
  Command,
  CommandConfig,
  getUsernameParam,
  getScaledCanvas,
  encodeURL,
  CommandError
} from '../../../utils';

const RENDER_WIDTH = 215;
const RENDER_HEIGHT = 260;
const RENDER_PADDING = 15;

// Used to render stats in correct order
const INGAME_SKILL_ORDER = [
  Metric.ATTACK,
  Metric.STRENGTH,
  Metric.DEFENCE,
  Metric.RANGED,
  Metric.PRAYER,
  Metric.MAGIC,
  Metric.RUNECRAFTING,
  Metric.CONSTRUCTION,
  Metric.HITPOINTS,
  Metric.AGILITY,
  Metric.HERBLORE,
  Metric.THIEVING,
  Metric.CRAFTING,
  Metric.FLETCHING,
  Metric.SLAYER,
  Metric.HUNTER,
  Metric.MINING,
  Metric.SMITHING,
  Metric.FISHING,
  Metric.COOKING,
  Metric.FIREMAKING,
  Metric.WOODCUTTING,
  Metric.FARMING,
  Metric.OVERALL
] as string[];

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
      type: ApplicationCommandOptionType.String,
      name: 'variant',
      description: 'The variant to show stats for (levels / exp / rank / ehp).',
      required: true,
      choices: [
        { name: 'Levels', value: RenderVariant.LEVELS },
        { name: 'Ranks', value: RenderVariant.RANKS },
        { name: 'Experience', value: RenderVariant.EXPERIENCE },
        { name: 'Efficient Hours Played', value: RenderVariant.EHP }
      ]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username or discord tag.'
    }
  ]
};

class PlayerStatsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    // Get the variant from subcommand
    const variant = interaction.options.getString('variant', true) as RenderVariant;

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    if (!player.latestSnapshot) {
      throw new CommandError(
        `Could not find this player's stats.`,
        'Tip: Try tracking them again using the /update command'
      );
    }

    const { attachment, fileName } = await this.render(player, variant);

    const embed = new EmbedBuilder()
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
    const skills = playerDetails.latestSnapshot!.data.skills;

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

      const isRanked = skills[skill].experience > -1;

      const x = Math.floor(index / 8);
      const y = index % 8;

      const originX = RENDER_PADDING - 7 + x * 67;
      const originY = RENDER_PADDING - 5 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${skill}.png`);

      // Badge background and skill icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX + 1, originY, icon.width / 2, icon.height / 2);

      ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';

      if (variant === RenderVariant.LEVELS) {
        ctx.font = '11px sans-serif';

        const level = isRanked ? `${skills[skill].level}` : '?';
        const lvlWidth = ctx.measureText(level).width;

        // Skill level
        ctx.fillText(level, originX + 42 - lvlWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EXPERIENCE) {
        const fontSize = skill === 'overall' ? 9 : 10;
        ctx.font = `${fontSize}px sans-serif`;

        const exp = isRanked ? `${formatNumber(skills[skill].experience, true, 1)}` : '?';
        const expWidth = ctx.measureText(exp).width;

        // Skill Experience
        ctx.fillText(exp, originX + 44 - expWidth / 2, originY + 17);
      } else if (variant === RenderVariant.RANKS) {
        ctx.font = '10px sans-serif';

        const rank = isRanked ? `${formatNumber(skills[skill].rank, true, 1)}` : '?';
        const rankWidth = ctx.measureText(rank).width;

        // Skill Rank
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      } else if (variant === RenderVariant.EHP) {
        ctx.font = '9px sans-serif';

        const ehp = isRanked ? `${round(skills[skill]?.ehp ?? 0, 1)}` : '?';
        const ehpWidth = ctx.measureText(ehp).width;

        // Skill EHP
        ctx.fillText(ehp, originX + 44 - ehpWidth / 2, originY + 16);
      }
    }

    const fileName = `${Date.now()}-${username.replace(/ /g, '_')}-${variant}.jpeg`;
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: fileName });

    return { attachment, fileName };
  }
}

export default new PlayerStatsCommand();
