import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';
import config from '../config';
import { handlePatreonTrigger, PATREON_TRIGGER_ID } from '../patreon-trigger';
import {
  deleteCompetition,
  deleteGroup,
  setCompetitionVisible,
  setGroupVisible
} from '../services/wiseoldman';
import { CommandError } from './commands';

enum Actions {
  DELETE = 'delete',
  APPROVE = 'approve',
  CONFIRM = 'confirm',
  CANCEL = 'cancel'
}

export enum ModerationType {
  GROUP = 'group',
  COMPETITION = 'competition'
}

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const [action, type, id, confirmation] = interaction.customId.split('/');
  console.log(type, action, id, confirmation);

  if (action === PATREON_TRIGGER_ID) {
    handlePatreonTrigger(interaction);
  } else if (action === Actions.DELETE || action === Actions.APPROVE) {
    await interaction.update({
      components: [createConfirmationButtons(action, type as ModerationType, id)]
    });
  } else if (action === Actions.CONFIRM) {
    if (type === ModerationType.GROUP) {
      if (confirmation === Actions.DELETE) {
        try {
          await deleteGroup(parseInt(id)).catch(e => {
            if (e.statusCode === 404) throw new CommandError('Group not found.');
            throw e;
          });
        } catch (error) {
          await interaction.reply({ ephemeral: true, content: `${error}` });
          return;
        }
      } else if (confirmation === Actions.APPROVE) {
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
    } else if (type === ModerationType.COMPETITION) {
      if (confirmation === Actions.DELETE) {
        try {
          await deleteCompetition(parseInt(id)).catch(e => {
            if (e.statusCode === 404) throw new CommandError('Competition not found.');
            throw e;
          });
        } catch (error) {
          await interaction.reply({ ephemeral: true, content: `${error}` });
          return;
        }
      } else if (confirmation === Actions.APPROVE) {
        try {
          await setCompetitionVisible(parseInt(id)).catch(e => {
            if (e.statusCode === 404) throw new CommandError('Competition not found.');
            throw e;
          });
        } catch (error) {
          await interaction.reply({ ephemeral: true, content: `${error}` });
          return;
        }
      }
    }

    const message = interaction.message;
    const oldEmbed = message.embeds[0];

    const editedEmbed = new EmbedBuilder()
      .setTitle(oldEmbed.title)
      .setDescription(oldEmbed.description)
      .setURL(oldEmbed.url)
      .setFooter({
        text: `${confirmation == Actions.DELETE ? 'Deleted ' : 'Approved '} by ${
          interaction.user.username
        }`
      })
      .setColor(confirmation == Actions.DELETE ? config.visuals.red : config.visuals.green);

    interaction.update({ embeds: [editedEmbed], components: [] });
  } else if (action === Actions.CANCEL) {
    await interaction.update({
      components: [createModerationButtons(type as ModerationType, parseInt(id))]
    });
  }
}

export function createModerationButtons(type: ModerationType, id: number) {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${Actions.APPROVE}/${type}/${id}`)
      .setLabel('Approve')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`${Actions.DELETE}/${type}/${id}`)
      .setLabel('Delete')
      .setStyle(ButtonStyle.Danger)
  );

  return actions;
}

function createConfirmationButtons(
  action: Actions,
  type: ModerationType,
  id: string
): ActionRowBuilder<ButtonBuilder> {
  const actions = new ActionRowBuilder<ButtonBuilder>();

  actions.addComponents(
    new ButtonBuilder()
      .setCustomId(`${Actions.CONFIRM}/${type}/${id}/${action}`)
      .setLabel(`Confirm ${action === Actions.DELETE ? 'deletion' : 'approval'}`)
      .setStyle(action === Actions.DELETE ? ButtonStyle.Danger : ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${Actions.CANCEL}/${type}/${id}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Secondary)
  );

  return actions;
}
