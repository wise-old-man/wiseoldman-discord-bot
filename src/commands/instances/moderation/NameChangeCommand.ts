import { NameChangeDetails, NameChangeStatus } from '@wise-old-man/utils';
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import womClient, { approveNameChange, denyNameChange } from '../../../services/wiseoldman';
import config from '../../../config';
import { Command, CommandConfig, CommandError, hasModeratorRole } from '../../../utils';

const CONFIG: CommandConfig = {
  name: 'namechange',
  description: 'Review and take action on a name change.',
  options: [
    {
      type: 'integer',
      name: 'name_change_id',
      description: 'The namechange Id.',
      required: true
    }
  ]
};

class NameChangeCommand extends Command {
  constructor() {
    super(CONFIG);
    this.private = true;
  }

  async execute(interaction: CommandInteraction) {
    const nameChangeId = interaction.options.getInteger('name_change_id', true);

    const reviewData = await womClient.nameChanges.getNameChangeDetails(nameChangeId).catch(e => {
      if (e.statusCode === 404) throw new CommandError('Name change ID not found.');
      if (e.statusCode === 500) throw new CommandError('Failed to load hiscores. Please try again.');

      throw e;
    });

    if (reviewData.nameChange.status !== NameChangeStatus.PENDING) {
      throw new CommandError('This name change is not pending.');
    }

    if (!reviewData.data) {
      throw new CommandError('Name change data was not found.');
    }

    const { nameChange, data } = reviewData;

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`Name change review: ${nameChange.oldName} → ${nameChange.newName}`)
      .setDescription(buildReviewMessage(data));

    const actions = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId(`namechange_approve/${nameChangeId}`)
        .setLabel('Approve')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId(`namechange_deny/${nameChangeId}`)
        .setLabel('Deny')
        .setStyle('DANGER')
    );

    await interaction.editReply({
      embeds: [response],
      components: hasModeratorRole(interaction.member as GuildMember) ? [actions] : []
    });

    const filter = async (buttonInteraction: ButtonInteraction) => {
      if (interaction.user.id !== buttonInteraction.user.id) {
        await buttonInteraction.reply({ content: 'These buttons are not for you!', ephemeral: true });
        return false;
      }
      return true;
    };

    // Only create collector if moderator to not get the ugly (edited) tag on message
    const collector = hasModeratorRole(interaction.member as GuildMember)
      ? interaction.channel?.createMessageComponentCollector({
          filter,
          componentType: 'BUTTON',
          max: 1,
          time: 1000 * 300
        })
      : undefined;

    collector?.on('end', async collection => {
      const buttonClicked = collection.first()?.customId;

      if (buttonClicked === `namechange_approve/${nameChangeId}`) {
        try {
          await approveNameChange(nameChangeId);
          response.setFooter({ text: `Approved ✅` }).setColor(config.visuals.green);
        } catch (error) {
          if ('statusCode' in error && error.statusCode === 504) {
            response
              .setFooter({ text: 'Approval timed out. Check the status again in a few minutes.' })
              .setColor(config.visuals.orange);
          } else {
            response.setFooter({ text: 'Failed to approve name change' }).setColor(config.visuals.red);
          }
        }
      } else if (buttonClicked === `namechange_deny/${nameChangeId}`) {
        try {
          await denyNameChange(nameChangeId);
          response.setFooter({ text: `Denied ❌` }).setColor(config.visuals.red);
        } catch (error) {
          response.setFooter({ text: 'Failed to deny name change' }).setColor(config.visuals.red);
        }
      }

      await interaction.editReply({ embeds: [response], components: [] });
    });
  }
}

function buildReviewMessage(data: NameChangeDetails['data']): string {
  const expDiff =
    data?.newStats.data.skills.overall && data?.oldStats.data.skills.overall
      ? data.newStats.data.skills.overall.experience - data.oldStats.data.skills.overall.experience
      : 0;

  const oldTotalLevel = data?.oldStats.data.skills.overall?.level;
  const newTotalLevel = data?.newStats.data.skills.overall?.level;

  const lines: Array<string> = [];

  lines.push(`New name on the hiscores? ${data?.isNewOnHiscores ? '✅' : '❌'}`);
  lines.push(`Has no negative gains? ${!data?.hasNegativeGains ? '✅' : '❌'}`);
  lines.push(`Hours difference? \`${data?.hoursDiff ? data.hoursDiff : 0}\``);
  lines.push(`EHP difference? \`${data?.ehpDiff ? data.ehpDiff : 0}\``);
  lines.push(`EHB difference? \`${data?.ehbDiff ? data.ehbDiff : 0}\``);
  lines.push(`Exp difference? \`${expDiff}\``);
  lines.push(`Old total level? \`${oldTotalLevel}\``);
  lines.push(`New total level? \`${newTotalLevel}\``);

  return lines.join('\n');
}

export default new NameChangeCommand();
