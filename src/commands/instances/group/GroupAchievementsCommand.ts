import {
  bold,
  Command,
  CommandConfig,
  CommandError,
  formatDate,
  getEmoji,
  getLinkedGroupId
} from '../../../utils';
import { CommandInteraction, MessageEmbed } from 'discord.js';
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

  async execute(interaction: CommandInteraction) {
    const groupId = await getLinkedGroupId(interaction);

    try {
      const groupAchievements = await womClient.groups.getGroupAchievements(groupId, { limit: 10 });

      const achievementList = groupAchievements
        .map(
          ach =>
            `${formatDate(ach.createdAt, 'DD MMM')} | ${bold(ach.player.displayName)} ${getEmoji(
              ach.metric
            )} ${ach.name}`
        )
        .join('\n');
      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle('Recent Group Achievements')
        .setDescription(achievementList)
        .setURL(`https://wiseoldman.net/groups/${groupId}/achievements/`);

      await interaction.editReply({ embeds: [response] });
    } catch (e) {
      throw new CommandError("Couldn't find that group or player.");
    }
  }
}

export default new GroupAchievements();
