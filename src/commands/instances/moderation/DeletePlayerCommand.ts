import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { deletePlayer } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, hasModeratorRole } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'delete-player',
  description: 'Delete a player from the database.',
  options: [
    {
      type: 'string',
      required: true,
      name: 'username',
      description: 'The username of the player to delete.'
    }
  ]
};

class DeletePlayerCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
  }

  async execute(interaction: CommandInteraction) {
    if (!hasModeratorRole(interaction.member as GuildMember)) {
      interaction.followUp({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
      return;
    }

    const username = interaction.options.getString('username', true);

    await deletePlayer(username).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Player not found.');
      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ \`${username}\` has been successfully deleted!`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new DeletePlayerCommand();
