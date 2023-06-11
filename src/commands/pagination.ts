import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Constants, MessageEmbed } from 'discord.js';

const PAGINATION_BUTTONS = {
  NEXT: {
    customId: 'CustomNextAction',
    type: Constants.MessageComponentTypes.BUTTON,
    style: 'PRIMARY',
    label: '>',
    run: ({ handler }) => {
      if (handler.index === handler.pages.length - 1) handler.index = 0;
      else ++handler.index;
    }
  },
  PREVIOUS: {
    customId: 'CustomPreviousAction',
    type: Constants.MessageComponentTypes.BUTTON,
    style: 'PRIMARY',
    label: '<',
    run: ({ handler }) => {
      if (handler.index === 0) handler.index = handler.pages.length - 1;
      else --handler.index;
    }
  }
} as const;

export function createPaginatedEmbed(template: MessageEmbed, idleDuration?: number) {
  const message = new PaginatedMessage({
    pageIndexPrefix: 'Page',
    embedFooterSeparator: '|',
    actions: [PAGINATION_BUTTONS.PREVIOUS, PAGINATION_BUTTONS.NEXT],
    template: template
  });

  if (idleDuration) message.idle = idleDuration;

  return message;
}
