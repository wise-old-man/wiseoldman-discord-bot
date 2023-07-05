import { CommandInteraction, MessageEmbed } from 'discord.js';
import { deleteGroup } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-group',
  description: 'Delete a group.',
  options: [
    {
      type: 'integer',
      name: 'id',
      description: 'The group ID.',
      required: true
    }
  ]
};

class DeleteGroupCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const groupId = interaction.options.getInteger('id', true);

    await deleteGroup(groupId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Group not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ Group has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new DeleteGroupCommand();
