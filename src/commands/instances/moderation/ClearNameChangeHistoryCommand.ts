import { CommandInteraction, MessageEmbed } from 'discord.js';
import { clearNameChangeHistory } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'clear-name-change-history',
  description: "Clear a player's name change history.",
  options: [
    {
      type: 'string',
      required: true,
      name: 'username',
      description: 'The username of the player to clear the history from.'
    },
    {
      type: 'user',
      name: 'requester',
      description: "Requester's Discord user tag."
    }
  ]
};

class ClearNameChangeHistoryCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true);
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);

    await clearNameChangeHistory(username).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Player not found.');
      if (e.message === 'No name changes were found for this player.') throw new CommandError(e.message);

      throw e;
    });

    // Respond on the WOM discord chat with a success status
    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setDescription(`✅ Name change history successfully cleared for  \`${username}\`!`);

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `Cleared name change history (Username: ${username})`,
      interaction.user,
      requester?.user
    );
  }
}

export default new ClearNameChangeHistoryCommand();
