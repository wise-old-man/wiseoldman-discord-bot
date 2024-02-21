import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';

const PAGINATION_BUTTONS = {
  NEXT: {
    customId: 'CustomNextAction',
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    label: '>',
    run: ({ handler }) => {
      if (handler.index === handler.pages.length - 1) handler.index = 0;
      else ++handler.index;
    }
  },
  PREVIOUS: {
    customId: 'CustomPreviousAction',
    type: ComponentType.Button,
    style: ButtonStyle.Primary,
    label: '<',
    run: ({ handler }) => {
      if (handler.index === 0) handler.index = handler.pages.length - 1;
      else --handler.index;
    }
  }
} as const;

export function createPaginatedEmbed(template: EmbedBuilder, idleDuration?: number) {
  const message = new PaginatedMessage({
    pageIndexPrefix: 'Page',
    embedFooterSeparator: '|',
    actions: [PAGINATION_BUTTONS.PREVIOUS, PAGINATION_BUTTONS.NEXT],
    template: template
  });

  if (idleDuration) message.idle = idleDuration;

  return message;
}
