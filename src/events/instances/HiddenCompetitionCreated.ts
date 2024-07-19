import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { encodeURL, Event } from '../../utils';
import { CompetitionListItem } from '@wise-old-man/utils';
import { createModerationButtons, ModerationType } from '../../utils/buttonInteractions';
import config from '../../config';

class HiddenCompetitionCreated implements Event {
  type: string;

  constructor() {
    this.type = 'HIDDEN_COMPETITION_CREATED';
  }

  async execute(data: CompetitionListItem, client: Client) {
    const { id, title, groupId, participantCount } = data['competition'];

    const actions = createModerationButtons(ModerationType.COMPETITION, id);

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`A hidden competition was created`)
      .setDescription(
        `Id: ${id}\nTitle: ${title}\nParticipants: ${participantCount}\nGroup Id: ${
          groupId ? '[' + groupId + '](https://wiseoldman.net/groups/' + groupId + ')' : groupId
        }`
      )
      .setURL(encodeURL(`https://wiseoldman.net/competitions/${id}`));

    const reviewChannel = client.channels?.cache.get(config.discord.channels.underAttackModeFeed);
    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel))
      return;

    await reviewChannel.send({
      embeds: [message],
      components: [actions]
    });
  }
}

export default new HiddenCompetitionCreated();
