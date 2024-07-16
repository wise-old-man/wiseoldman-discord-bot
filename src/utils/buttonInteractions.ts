import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../config';
import { handlePatreonTrigger, PATREON_TRIGGER_ID } from '../patreon-trigger';
import { deleteGroup, setGroupVisible } from '../services/wiseoldman';
import { CommandError } from './commands';

enum Actions {
  GROUP_DELETE = 'group_delete',
  GROUP_APPROVE = 'group_approve',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [action, id, confirmation] = interaction.customId.split('/');

  if (action === PATREON_TRIGGER_ID) {
    handlePatreonTrigger(interaction);
  } else if (action === Actions.GROUP_DELETE) {
    await interaction.update({
      components: [buildConfirmationButtons(id, action)]
    });
  } else if (action === Actions.GROUP_APPROVE) {
    await interaction.update({
      components: [buildConfirmationButtons(id, action)]
    });
  } else if (action === Actions.CONFIRM) {
    if (confirmation === Actions.GROUP_DELETE) {
      try {
        await deleteGroup(parseInt(id)).catch(e => {
          if (e.statusCode === 404) throw new CommandError('Group not found.');
          throw e;
        });
      } catch (error) {
        await interaction.reply({ ephemeral: true, content: `${error}` });
        return;
      }
    } else if (confirmation === Actions.GROUP_APPROVE) {
      try {
        await setGroupVisible(parseInt(id)).catch(e => {
          if (e.statusCode === 404) throw new CommandError('Group not found.');
          throw e;
        });
      } catch (error) {
        await interaction.reply({ ephemeral: true, content: `${error}` });
        return;
      }
    }

    const message = interaction.message;
    const oldEmbed = message.embeds[0];

    const editedEmbed = new EmbedBuilder()
      .setTitle(oldEmbed.title)
      .setDescription(oldEmbed.description)
      .setURL(oldEmbed.url)
      .setFooter({
        text: `${confirmation == Actions.GROUP_DELETE ? 'Deleted ' : 'Approved '} by ${
          interaction.user.username
        }`
      })
      .setColor(confirmation == Actions.GROUP_DELETE ? config.visuals.red : config.visuals.green);

    interaction.update({ embeds: [editedEmbed], components: [] });
  } else if (action === Actions.CANCEL) {
    await interaction.update({
      components: [createModerationButtons(parseInt(id))]
    });
  }
}

export function createModerationButtons(id: number) {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`group_approve/${id}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`group_delete/${id}`).setLabel('Delete').setStyle(ButtonStyle.Danger)
  );

  return actions;
}

function buildConfirmationButtons(id: string, action: string): ActionRowBuilder<ButtonBuilder> {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`confirm/${id}/${action}`)
      .setLabel(`Confirm ${action === 'group_delete' ? 'deletion' : 'approval'}`)
      .setStyle(action === 'group_delete' ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`cancel/${id}`).setLabel('Cancel').setStyle(ButtonStyle.Secondary)
  );

  return actions;
}
