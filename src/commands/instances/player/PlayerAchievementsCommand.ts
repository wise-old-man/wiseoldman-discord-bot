import { Achievement, PlayerDetails } from '@wise-old-man/utils';
import Canvas from 'canvas';
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import {
  Command,
  CommandConfig,
  CommandError,
  encodeURL,
  formatDate,
  getScaledCanvas,
  getUsernameParam
} from '../../../utils';

const RENDER_WIDTH = 280;
const RENDER_HEIGHT = 165;
const RENDER_PADDING = 15;

const CONFIG: CommandConfig = {
  name: 'achievements',
  description: "View a player's recent achievements.",
  options: [
    {
      type: 'string',
      name: 'username',
      description: 'In-game username or discord tag'
    }
  ]
};

class PlayerAchievementsCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    const achievements = await womClient.players.getPlayerAchievements(username);

    if (!achievements || achievements.length === 0) {
      throw new CommandError(`${player.displayName} has no achievements.`);
    }

    const mostRecentAchievements = achievements
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    const { attachment, fileName } = await this.render(player, mostRecentAchievements);

    const embed = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}/achievements/`))
      .setTitle(`${player.displayName} - Recent achievements`)
      .setImage(`attachment://${fileName}`)
      .setFooter({ text: 'Last updated' })
      .setTimestamp(player.updatedAt);

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }

  async render(player: PlayerDetails, achievements: Achievement[]) {
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
}

export default new PlayerAchievementsCommand();
