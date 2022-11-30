import { NameChangeDetails, NameChangeStatus } from '@wise-old-man/utils';
import {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import { approve, deny } from '../../../api/modules/names';
import womClient from '../../../api/wom-api';
import config from '../../../config';
import { Command, CommandConfig } from '../../utils/commands';
import { getEmoji, hasModeratorRole } from '../../../utils/discord';
import { CommandError, ErrorCode } from '../../../utils/error';

const CONFIG: CommandConfig = {
  name: 'namechange',
  description: 'Review and take action on a name change.',
  options: [
    {
      type: 'integer',
      required: true,
      name: 'name_change_id',
      description: 'The namechange Id.'
    }
  ]
};

class NameChangeCommand extends Command {
  constructor() {
    super(CONFIG);
  }

  async execute(message: CommandInteraction) {
    const nameChangeId = message.options.getInteger('name_change_id', true);

    const reviewData = await womClient.nameChanges.getNameChangeDetails(nameChangeId);

    if (reviewData.nameChange.status !== NameChangeStatus.PENDING) {
      throw new CommandError(ErrorCode.NAME_CHANGE_NOT_PENDING);
    }

    if (!reviewData.data) {
      throw new CommandError(ErrorCode.NAME_CHANGE_NOT_FOUND);
    }

    const { nameChange, data } = reviewData;

    const response = new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle(`Name change review: ${nameChange.oldName} → ${nameChange.newName}`)
      .setDescription(buildReviewMessage(data));

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
          response.setFooter({ text: `Approved ${getEmoji('success')}` }).setColor(config.visuals.green);
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
  }
}

function buildReviewMessage(data: NameChangeDetails['data']): string {
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

export default new NameChangeCommand();
