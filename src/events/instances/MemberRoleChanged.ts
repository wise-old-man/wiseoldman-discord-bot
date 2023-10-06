import { Client, MessageEmbed } from 'discord.js';
import { Event, propagateMessage, NotificationType, getGroupRoleEmoji } from '../../utils';
import { GroupRole, GroupRoleProps } from '@wise-old-man/utils';
import config from '../../config';

// TODO: Change these to use the types and enums from @wise-old-man/utils
// It's also probably wrong here because role is nullable
enum ActivityType {
  joined,
  left,
  changed_role
}

interface MemberActivity {
  groupId: number;
  playerId: number;
  type: ActivityType;
  role: GroupRole;
  previousRole: GroupRole;
  displayName: string;
}

class MemberRoleChanged implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_CHANGED_ROLES';
  }

  async execute(data: MemberActivity[], client: Client<boolean>): Promise<void> {
    const message = buildMessage(data);
    if (!data || data.length === 0) return;

    const groupId = data[0].groupId;

    await propagateMessage(client, groupId, NotificationType.MEMBERS_LIST_CHANGED, message);
  }
}

function buildMessage(data: MemberActivity[]) {
  let content = '';

  // Show maximum of 10 role changes before linking to the full changelog on the website.
  for (let i = 0; i < Math.min(data.length, 10); i++) {
    const activity = data[i];
    const previousRole = GroupRoleProps[activity.previousRole].name;
    const newRole = GroupRoleProps[activity.role].name;

    content += `${activity.displayName}: \`${
      GroupRoleProps[activity.previousRole].name
    }\` ${getGroupRoleEmoji(previousRole)} -> \`${
      GroupRoleProps[activity.role].name
    }\` ${getGroupRoleEmoji(newRole)}\n`;
  }

  // TODO: Link to the actual page for the activities
  content += data.length > 10 ? `\n[+${data.length - 10} more changes](https://wiseoldman.net)` : ``;

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setTitle('Member roles changed')
    .setDescription(content);
}

export default new MemberRoleChanged();
