import { Client, MessageEmbed } from 'discord.js';
import { Event, propagateMessage, NotificationType, getGroupRoleEmoji } from '../../utils';
import { GroupRole, GroupRoleProps, Player } from '@wise-old-man/utils';
import config from '../../config';

interface MemberActivity {
  groupId: number;
  members: {
    role: GroupRole;
    previousRole: GroupRole;
    player: Player;
  }[];
}

class MembersRolesChanged implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_CHANGED_ROLES';
  }

  async execute(data: MemberActivity, client: Client<boolean>): Promise<void> {
    const { groupId } = data;

    if (!data || data.members.length === 0 || !groupId) return;

    const message = buildMessage(data);

    await propagateMessage(client, groupId, NotificationType.MEMBERS_LIST_CHANGED, message);
  }
}

function buildMessage(data: MemberActivity) {
  const { groupId, members } = data;
  let content = '';

  // Show maximum of 10 role changes before linking to the full changelog on the website.
  for (let i = 0; i < Math.min(members.length, 10); i++) {
    const activity = members[i];

    const previousRole = GroupRoleProps[activity.previousRole].name;
    const newRole = GroupRoleProps[activity.role].name;

    content += `${activity.player.displayName}: \`${
      GroupRoleProps[activity.previousRole].name
    }\` ${getGroupRoleEmoji(previousRole)} -> \`${
      GroupRoleProps[activity.role].name
    }\` ${getGroupRoleEmoji(newRole)}\n`;
  }

  content +=
    members.length > 10
      ? `\n[+${members.length - 10} more changes](https://wiseoldman.net/groups/${groupId})`
      : ``;

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setURL(`https://wiseoldman.net/groups/${groupId}`)
    .setTitle(`${members.length} Member roles changed`)
    .setDescription(content);
}

export default new MembersRolesChanged();
