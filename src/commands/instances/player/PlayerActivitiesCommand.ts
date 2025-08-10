import { formatNumber, isActivity, PlayerDetailsResponse } from '@wise-old-man/utils';
import Canvas from 'canvas';
import {
  ApplicationCommandOptionType,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder
} from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import {
  Command,
  CommandConfig,
  CommandError,
  encodeURL,
  getScaledCanvas,
  getUsernameParam
} from '../../../utils';

const RENDER_WIDTH = 285;
const RENDER_HEIGHT = 130;
const RENDER_PADDING = 15;

enum RenderVariant {
  SCORES = 'scores',
  RANKS = 'ranks'
}

const CONFIG: CommandConfig = {
  name: 'activities',
  description: "View a player's activity scores.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'variant',
      description: 'The variant to show stats for (scores / rank).',
      required: true,
      choices: [
        { name: 'Scores', value: RenderVariant.SCORES },
        { name: 'Ranks', value: RenderVariant.RANKS }
      ]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username or discord tag.'
    }
  ]
};

class PlayerActivitiesCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
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
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}?view=activities`))
      .setTitle(`${player.displayName} - Activity ${variant}`)
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: 'Last updated' })
      .setTimestamp(player.updatedAt);

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }

  async render(playerDetails: PlayerDetailsResponse, variant: RenderVariant) {
    const username = playerDetails.username;
    const activities = playerDetails.latestSnapshot!.data.activities;

    // Create a scaled empty canvas
    const { canvas, ctx, width, height } = getScaledCanvas(RENDER_WIDTH, RENDER_HEIGHT);

    // Load images
    const badge = await Canvas.loadImage(`./public/x2/badge.png`);

    // Background fill
    ctx.fillStyle = '#1d1d1d';
    ctx.fillRect(0, 0, width, height);

    for (const [index, activity] of Object.keys(activities).entries()) {
      if (!isActivity(activity)) continue;

      const x = Math.floor(index / 4);
      const y = index % 4;

      const originX = RENDER_PADDING - 7 + x * 69;
      const originY = RENDER_PADDING - 8 + y * 31;

      const icon = await Canvas.loadImage(`./public/x2/${activity}.png`);

      // Badge background and activity icon
      ctx.drawImage(badge, originX, originY, 64, 26);
      ctx.drawImage(icon, originX, originY, icon.width / 2, icon.height / 2);

      const activityValue = activities[activity];
      const isRanked = activityValue.score && activityValue.score > -1;

      if (variant === RenderVariant.SCORES) {
        ctx.font = '11px Arial';

        const score = `${
          isRanked
            ? activityValue.score >= 10000
              ? formatNumber(activityValue.score, true)
              : activityValue.score
            : '?'
        }`;
        const scoreWidth = ctx.measureText(score).width;

        // Activity score
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(score, originX + 42 - scoreWidth / 2, originY + 17);
      } else if (variant === RenderVariant.RANKS) {
        ctx.font = '10px Arial';

        const rank = `${isRanked ? formatNumber(activityValue.rank, true, 1) : '?'}`;
        const rankWidth = ctx.measureText(rank).width;

        // Activity rank
        ctx.fillStyle = isRanked ? '#ffffff' : '#6e6e6e';
        ctx.fillText(rank, originX + 44 - rankWidth / 2, originY + 17);
      }
    }

    const fileName = `${Date.now()}-${username.replace(/ /g, '_')}-${variant}.jpeg`;
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: fileName });

    return { attachment, fileName };
  }
}

export default new PlayerActivitiesCommand();
