import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, getUsernameParam } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'update',
  description: 'Update (track) a player.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username or discord tag.'
    }
  ]
};

class UpdatePlayerCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    const result = await womClient.players.updatePlayer(username).catch(e => {
      if (e.statusCode === 500) {
        throw new CommandError('The hiscores are currently down. Please try again later.');
      }

      if (e.statusCode === 429) {
        throw new CommandError('This player has been updated recently. Please try again later.');
      }

      if (e.statusCode === 404) {
        throw new CommandError(
          `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
          'Tip: Try tracking them first using the /update command'
        );
      }

      throw e;
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(`Successfully updated **${result.displayName}**.`)
      .setFooter({
        text: `Tip: You can keep yourself automatically updated through Runelite by enabling Wise Old Man in the "XP Updater" plugin.`
      });

    await interaction.editReply({ embeds: [response] });
  }
}

export default new UpdatePlayerCommand();
