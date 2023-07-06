import { Client, MessageEmbed } from 'discord.js';
import { Event, propagateMessage, NotificationType } from '../../utils';
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

interface DataPayload {
  type: ActivityType;
  memberActivity: MemberActivity[];
}

class MemberRoleChanged implements Event {
  type: string;

  constructor() {
    this.type = 'CHANGED_ROLE';
  }

  async execute(data: DataPayload, client: Client<boolean>): Promise<void> {
    const { memberActivity } = data;
    const message = buildMessage(memberActivity);
    if (!memberActivity || memberActivity.length === 0) return;

    const groupId = memberActivity[0].groupId;

    await propagateMessage(client, groupId, NotificationType.MEMBERS_LIST_CHANGED, message);
  }
}

function buildMessage(data: MemberActivity[]) {
  // TODO: Show role emojis if there are less than 5, maybe 10 role changes?

  if (data.length === 1) {
    const { role, previousRole, displayName } = data[0];
    return new MessageEmbed()
      .setColor(config.visuals.blue)
      .setTitle('Member role changed')
      .setDescription(
        `${displayName}: ${GroupRoleProps[previousRole].name} -> ${GroupRoleProps[role].name}`
      );
  }

  let content = '';
  for (const activity of data) {
    content += `${activity.displayName}: ${GroupRoleProps[activity.previousRole].name} -> ${
      GroupRoleProps[activity.role].name
    }\n`;
  }

  return new MessageEmbed()
    .setColor(config.visuals.blue)
    .setTitle('Member roles changed')
    .setDescription(content);
}

export default new MemberRoleChanged();
