import { CommandInteraction, MessageEmbed } from 'discord.js';
import { removeFromGroup } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'remove-from-group',
  description: 'Remove a player from a group.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The group ID.',
      required: true
    },
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.',
      required: true
    },
    {
      type: 'user',
      name: 'requester',
      description: "Requester's Discord user tag."
    }
  ]
};

class RemoveFromGroupCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);
    const username = interaction.options.getString('username', true);
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ ${username} has been successfully removed from the group.`);

    try {
      await removeFromGroup(groupId, username);

      await interaction.editReply({ embeds: [response] });

      sendModLog(
        interaction.guild,
        `Removed \`${username}\` from group (ID: ${groupId})`,
        interaction.user,
        requester?.user
      );
    } catch (e) {
      response.setColor(config.visuals.red).setDescription(`${e.message}`);
      await interaction.editReply({ embeds: [response] });
    }
  }
}

export default new RemoveFromGroupCommand();
