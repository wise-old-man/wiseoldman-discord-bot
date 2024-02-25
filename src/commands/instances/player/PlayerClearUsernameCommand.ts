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
    const userId = interaction.user.id;

    let recordCount = await prisma.alias.count({
        where: {
            userId: userId,
        }
    });

    if(recordCount == 0){
        throw new CommandError(
            `<@${userId}> does not have a player alias set.`,
            'Tip: You can set an alias using the /setrsn command'
          );
    }

    // Update the database
    await prisma.alias.delete({
        where: {
            userId: userId,
        },
    });

    const response = new MessageEmbed()
      .setColor(config.visuals.green)
      .setTitle('Player alias cleared!')
      .setDescription(`<@${userId}> has now cleared their player alias (RSN).`);

    await interaction.editReply({ embeds: [response] });
  }
}

export default new PlayerClearUsernameCommand();
