import { CommandInteraction, MessageEmbed } from 'discord.js';
import config from '../../../config';
import prisma from '../../../services/prisma';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, encodeURL } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'clearrsn',
  description: 'Clear your set default username (alias).'
};

class PlayerClearUsernameCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    const username = interaction.options.getString('username', true);
    const userId = interaction.user.id;

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    // Update the database
    await prisma.alias.delete({
        where: {
            userId: userId,
        },
    });

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle('Player alias cleared!')
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setDescription(`<@${userId}> has now cleared their player alias (RSN).`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new PlayerClearUsernameCommand();