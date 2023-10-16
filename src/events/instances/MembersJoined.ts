import { Client, MessageEmbed } from 'discord.js';
import { GroupRole, GroupRoleProps, Player } from '@wise-old-man/utils';
import config from '../../config';
import { Event } from '../../utils/events';
import { propagateMessage, NotificationType, getGroupRoleEmoji } from '../../utils';

interface MembersJoinedData {
  groupId: number;
  members: {
    role: GroupRole;
    player: Player;
  }[];
}

class MembersJoined implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_JOINED';
  }

  async execute(data: MembersJoinedData, client: Client) {
    const { groupId } = data;

    if (!groupId) return;

    const message = buildMessage(data);
    await propagateMessage(client, groupId, NotificationType.MEMBERS_LIST_CHANGED, message);
  }
}

function buildMessage(data: MembersJoinedData) {
  const { groupId, members } = data;

  let content = ``;

  for (let i = 0; i < Math.min(members.length, 10); i++) {
    const member = members[i];
    const role = GroupRoleProps[member.role].name;

    content += `${getGroupRoleEmoji(role)} ${member.player.displayName}\n`;
  }

  // TODO: Link to the actual page for the activities
  content +=
    members.length > 10
      ? `\n[+${members.length - 10} more changes](https://wiseoldman.net/groups/${groupId})`
      : ``;

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setTitle(`🎉 ${members.length} New group members joined`)
    .setURL(`https://wiseoldman.net/groups/${groupId})`)
    .setDescription(content);
}

export default new MembersJoined();
