import { CommandInteraction, MessageEmbed } from 'discord.js';
import { formatNumber, round } from '@wise-old-man/utils';
import config from '../../../config';
import { encodeURL } from '../../../utils';
import womClient from '../../../api/wom-api';
import { Command, CommandConfig } from '../../../commands/utils/commands';
import { getUsernameParam } from '../../../utils/wooow';
import { CommandError, ErrorCode } from '../../../utils/error';

const CONFIG: CommandConfig = {
  name: 'ttm',
  description: "View a player's efficiency stats.",
  options: [
    {
      type: 'string',
      name: 'username',
      description: 'In-game username.'
    }
  ]
};

class PlayerEfficiencyCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: CommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        ErrorCode.PLAYER_NOT_FOUND,
        "Player not found. Possibly hasn't been tracked yet on WiseOldMan.",
        'Tip: Try tracking them first using the /update command'
      );
    });

    const embed = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setURL(encodeURL(`https://wiseoldman.net/players/${player.displayName}`))
      .setTitle(`${player.displayName} - Efficiency Stats`)
      .addFields([
        {
          name: 'Time To Max',
          value: player.ttm ? `${round(player.ttm, 2)} hours` : '---'
        },
        {
          name: 'Time To 200m All',
          value: player.tt200m ? `${round(player.tt200m, 2)} hours` : '---'
        },
        {
          name: 'Efficient Hours Played',
          value: player.ehp ? `${round(player.ehp, 2)}` : '---'
        },
        {
          name: 'Efficient Hours Bossed',
          value: player.ehb ? `${round(player.ehb, 2)}` : '---'
        },
        {
          name: 'Total Experience',
          value: player.exp ? `${formatNumber(player.exp, true)}` : '---'
        }
      ])
      .setFooter({ text: 'Last updated' })
      .setTimestamp(player.updatedAt);

    await interaction.editReply({ embeds: [embed] });
  }
}

export default new PlayerEfficiencyCommand();
