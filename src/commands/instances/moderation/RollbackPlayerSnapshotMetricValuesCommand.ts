import { isMetric } from '@wise-old-man/utils';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import config from '../../../config';
import { parseMetricAbbreviation, rollbackSnapshotMetricValues } from '../../../services/wiseoldman';
import { Command, CommandConfig, CommandError, sendModLog } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'rollback-player-snapshot-values',
  description: 'Rollback a player snapshot metric values.',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'username',
      description: 'In-game username.',
      required: true
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'metric',
      description: 'The metric to rollback values for.',
      required: true,
      autocomplete: true
    }
  ]
};

class RollbackPlayerSnapshotMetricValuesCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
    this.moderation = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const requesterId = interaction.options.getUser('requester', false)?.id;

    const requester = interaction.guild?.members.cache.find(m => m.id === requesterId);
    const username = interaction.options.getString('username', true);

    const metricParam = parseMetricAbbreviation(interaction.options.getString('metric', true));
    const metric = metricParam !== null && isMetric(metricParam) ? metricParam : null;

    if (metric === null) {
      throw new CommandError(`Invalid metric.`);
    }

    await rollbackSnapshotMetricValues(username, metric).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Player not found.');
      throw e;
    });

    const response = new EmbedBuilder()
      .setColor(config.visuals.green)
      .setDescription(
        `✅ Snapshot (${metric}) metric value(s) successfully rolled back for \`${username}\`!`
      );

    await interaction.editReply({ embeds: [response] });

    sendModLog(
      interaction.guild,
      `**Snapshot Metric Values Rolled Back**\nUsername: \`${username}\`` +
        (requesterId
          ? `\nRequested by: <@${requesterId}>, \`${requesterId}\`, \`${requester?.user.username}\``
          : ''),
      interaction.user
    );
  }
}

export default new RollbackPlayerSnapshotMetricValuesCommand();
