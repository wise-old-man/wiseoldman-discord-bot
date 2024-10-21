import { Client, EmbedBuilder } from 'discord.js';
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
    await propagateMessage(client, groupId, NotificationType.MEMBERS_JOINED, message);
  }
}

function buildMessage(data: MembersJoinedData) {
  const { groupId, members } = data;

  let content = ``;

  // Show maximum of 10 member joins before linking to the full changelog on the website.
  for (let i = 0; i < Math.min(members.length, 10); i++) {
    const member = members[i];
    const role = GroupRoleProps[member.role].name;

    content += `${getGroupRoleEmoji(role)} ${member.player.displayName}\n`;
  }

  if (members.length > 10) {
    content += `\n[+${members.length - 10} more changes](https://wiseoldman.net/groups/${groupId}?dialog=group-activity)`;
  }

  const title = `🎉 ${members.length} New group ${members.length === 1 ? 'member' : 'members'} joined`;

  return new EmbedBuilder()
    .setColor(config.visuals.blue)
    .setTitle(title)
    .setURL(`https://wiseoldman.net/groups/${groupId}?dialog=group-activity`)
    .setDescription(content);
}

export default new MembersJoined();
