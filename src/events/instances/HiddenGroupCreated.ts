import { ChannelType, Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Event } from '../../utils/events';
import { GroupListItem } from '@wise-old-man/utils';
import config from '../../config';
import { encodeURL } from '../../utils';
import { createModerationButtons, ModerationType } from '../../utils/buttonInteractions';

class HiddenGroupCreated implements Event {
  type: string;

  constructor() {
    this.type = 'HIDDEN_GROUP_CREATED';
  }

  async execute(data: GroupListItem, client: Client) {
    const { id, name, description, clanChat, memberCount } = data['group'];

    const actions = createModerationButtons(ModerationType.GROUP, id);

    const message = new EmbedBuilder()
      .setColor(config.visuals.blue)
      .setTitle(`Hidden group created`)
      .setDescription(
        `Id: ${id}\nName: ${name}\nDescription: ${description}\nClan chat: ${clanChat}\nMembers: ${memberCount}`
      )
      .setURL(encodeURL(`https://wiseoldman.net/groups/${id}`));

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

export default new HiddenGroupCreated();
