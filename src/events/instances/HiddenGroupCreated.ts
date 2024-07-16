import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Event } from '../../utils/events';
import { Group, GroupListItem } from '@wise-old-man/utils';
import config from '../../config';
import { encodeURL } from '../../utils';
import { createModerationButtons } from '../../utils/buttonInteractions';

class HiddenGroupCreated implements Event {
  type: string;

  constructor() {
    this.type = 'HIDDEN_GROUP_CREATED';
  }

  async execute(data: Group, client: Client) {
    const { id, name, description } = data['group'];

    const actions = createModerationButtons(id);

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`A hidden group was created`)
      .setDescription(`Id: ${id}\nName: ${name}\nDescription: ${description}`)
      .setURL(encodeURL(`https://wiseoldman.net/groups/${id}`));

    const reviewChannel = client.channels?.cache.get(config.discord.channels.flaggedPlayerReviews);
    if (!reviewChannel) return;
    if (!((channel): channel is TextChannel => channel.type === ChannelType.GuildText)(reviewChannel))
      return;

    await reviewChannel.send({
      embeds: [message],
      components: [actions]
    });
  }
}

export default new HiddenGroupCreated();
