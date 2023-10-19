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

    await propagateMessage(client, groupId, NotificationType.MEMBERS_ROLES_CHANGES, message);
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

    content += `${activity.player.displayName}: \`${previousRole}\` ${getGroupRoleEmoji(
      previousRole
    )} -> \`${newRole}\` ${getGroupRoleEmoji(newRole)}\n`;
  }

  if (members.length > 10) {
    content += `\n[+${members.length - 10} more changes](https://wiseoldman.net/groups/${groupId})`;
  }

  const title = `${members.length} Member ${members.length === 1 ? 'role' : 'roles'} changed`;

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setURL(`https://wiseoldman.net/groups/${groupId}`)
    .setTitle(title)
    .setDescription(content);
}

export default new MembersRolesChanged();
