import {
  bold,
  Command,
  CommandConfig,
  CommandError,
  formatDate,
  getEmoji,
  getLinkedGroupId
} from '../../../utils';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import womClient from '../../../services/wiseoldman';
import config from '../../../config';

const CONFIG: CommandConfig = {
  name: 'achievements',
  description: "View a group's most recent achievements."
};

class GroupAchievements extends Command {
  constructor() {
    super(CONFIG);
  }

  async runCommandLogic(interaction: ChatInputCommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    const groupAchievements = await womClient.groups
      .getGroupAchievements(groupId, { limit: 10 })
      .catch(() => {
        throw new CommandError("Couldn't find that group.");
      });

    const achievementList = groupAchievements
      .map(
        ach =>
          `${formatDate(ach.createdAt, 'DD MMM')} | ${bold(ach.player.displayName)} ${getEmoji(
            ach.metric
          )} ${ach.name}`
      )
      .join('\n');

    const response = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle('Recent Group Achievements')
      .setDescription(achievementList)
      .setURL(`https://league.wiseoldman.net/groups/${groupId}/achievements/`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new GroupAchievements();
