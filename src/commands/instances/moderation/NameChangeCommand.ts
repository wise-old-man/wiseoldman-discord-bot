import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { approve, deny } from '../../../api/modules/names';
import config from '../../../config';
import { Command } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import CommandError from '../../CommandError';
import { NameChangeStatus } from '@wise-old-man/utils';
import womClient from '../../../api/wom-api';

class NameChangeCommand implements Command {
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option =>
        option.setName('name_change_id').setDescription('Name change id').setRequired(true)
      )
      .setName('namechange')
      .setDescription('Review and take action on a name change');
  }

  async execute(message: CommandInteraction) {
    const nameChangeId = message.options.getInteger('name_change_id', true);
    try {
      await message.deferReply();

      const reviewData = await womClient.nameChanges.getNameChangeDetails(nameChangeId);

      if (!reviewData.data) {
        throw new CommandError('Name change data was not found.');
      }

      if (reviewData.nameChange.status !== NameChangeStatus.PENDING) {
        throw new CommandError('This name change is not pending.');
      }

      const response = new MessageEmbed()
        .setColor(config.visuals.blue)
        .setTitle(
          `Name change review: ${reviewData.nameChange.oldName} → ${reviewData.nameChange.newName}`
        )
        .setDescription(this.buildReviewMessage(reviewData.data));

      const row = new MessageActionRow().addComponents(
        new MessageButton().setCustomId('namechange_approve').setLabel('Approve').setStyle('SUCCESS'),
        new MessageButton().setCustomId('namechange_deny').setLabel('Deny').setStyle('DANGER')
      );

      await message.editReply({
        embeds: [response],
        components: hasModeratorRole(message.member as GuildMember) ? [row] : []
      });

      const filter = async (buttonInteraction: ButtonInteraction) => {
        if (message.user.id !== buttonInteraction.user.id) {
          await buttonInteraction.reply({ content: 'These buttons are not for you!', ephemeral: true });
          return false;
        }
        return true;
      };

      // Only create collector if moderator to not get the ugly (edited) tag on message
      const collector = hasModeratorRole(message.member as GuildMember)
        ? message.channel?.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            max: 1,
            time: 1000 * 300
          })
        : undefined;

      collector?.on('end', async collection => {
        const buttonClicked = collection.first()?.customId;
        if (buttonClicked === 'namechange_approve') {
          try {
            await approve(nameChangeId);
            response
              .setFooter({ text: `Approved ${getEmoji('success')}` })
              .setColor(config.visuals.green);
          } catch (error) {
            response.setFooter({ text: 'Failed to approve name change' }).setColor(config.visuals.red);
          }
        } else if (buttonClicked === 'namechange_deny') {
          try {
            await deny(nameChangeId);
            response.setFooter({ text: `Denied ${getEmoji('error')}` }).setColor(config.visuals.red);
          } catch (error) {
            response.setFooter({ text: 'Failed to deny name change' }).setColor(config.visuals.red);
          }
        }

        await message.editReply({ embeds: [response], components: [] });
      });
    } catch (error) {
      if (error instanceof CommandError) throw error;
      throw new CommandError('Failed to review name change.');
    }
  }

  buildReviewMessage(data: any): string {
    const { isNewOnHiscores, hasNegativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats, newStats } = data;
    const expDiff =
      newStats.data.skills.overall && oldStats.data.skills.overall
        ? newStats.data.skills.overall.experience - oldStats.data.skills.overall.experience
        : 0;
    const oldTotalLevel = oldStats.data.skills.overall?.level;
    const newTotalLevel = newStats.data.skills.overall?.level;

    const lines = [];

    lines.push(`New name on the hiscores? ${isNewOnHiscores ? getEmoji('success') : getEmoji('error')}`);
    lines.push(`Has no negative gains? ${!hasNegativeGains ? getEmoji('success') : getEmoji('error')}`);
    lines.push(`Hours difference? \`${hoursDiff}\``);
    lines.push(`EHP difference? \`${ehpDiff}\``);
    lines.push(`EHB difference? \`${ehbDiff}\``);
    lines.push(`Exp difference? \`${expDiff}\``);
    lines.push(`Old total level? \`${oldTotalLevel}\``);
    lines.push(`New total level? \`${newTotalLevel}\``);

    return lines.join('\n');
  }
}

export default new NameChangeCommand();
