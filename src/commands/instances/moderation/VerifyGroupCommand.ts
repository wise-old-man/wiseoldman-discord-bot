import { CommandInteraction, MessageEmbed } from 'discord.js';
import { verifyGroup } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'verify-group',
  description: 'Set a group as verified.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The group ID.',
      required: true
    },
    {
      type: 'user',
      name: 'user',
      description: 'Discord user tag.',
      required: true
    }
  ]
};

class VerifyGroupCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);
    const userId = interaction.options.getUser('user', true).id;

    const user = interaction.guild?.members.cache.find(m => m.id === userId);

    if (!user) {
      throw new CommandError("Couldn't find that user.");
    }

    const group = await verifyGroup(groupId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Group not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ \`${group.name}\` has been successfully verified!`);

    await interaction.followUp({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Verified ${group.name} (${group.id}) - Leader: <@${userId}>`,
      interaction.user
    );

    // Add the "Group Leader" role to the user
    user.roles.add(config.discord.roles.groupLeader).catch(console.log);
  }
}

export default new VerifyGroupCommand();
