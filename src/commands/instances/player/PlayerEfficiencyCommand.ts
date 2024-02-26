import { formatNumber, round } from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import womClient from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, encodeURL, getUsernameParam } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'ttm',
  description: "View a player's efficiency stats.",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username or discord tag.'
    }
  ]
};

class PlayerEfficiencyCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(interaction: ChatInputCommandInteraction) {
    // Grab the username from the command's arguments or database alias
    const username = await getUsernameParam(interaction);

    const player = await womClient.players.getPlayerDetails(username).catch(() => {
      throw new CommandError(
        `Player "${username}" not found. Possibly hasn't been tracked yet on Wise Old Man.`,
        'Tip: Try tracking them first using the /update command'
      );
    });

    const embed = new EmbedBuilder()
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
