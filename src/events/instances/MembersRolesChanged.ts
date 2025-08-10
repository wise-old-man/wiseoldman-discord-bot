import { AsyncResult, errored } from '@attio/fetchable';
import { GroupRole, GroupRoleProps, PlayerResponse } from '@wise-old-man/utils';
import { Client, EmbedBuilder } from 'discord.js';
import config from '../../config';
import {
  Event,
  getGroupRoleEmoji,
  MessagePropagationError,
  NotificationType,
  propagateMessage
} from '../../utils';

interface MemberActivity {
  groupId: number;
  members: {
    role: GroupRole;
    previousRole: GroupRole;
    player: Pick<PlayerResponse, 'displayName'>;
  }[];
}

class MembersRolesChanged implements Event {
  type: string;

  constructor() {
    this.type = 'GROUP_MEMBERS_CHANGED_ROLES';
  }

  async execute(
    data: MemberActivity,
    client: Client<boolean>
  ): AsyncResult<
    true,
    { code: 'MISSING_GROUP_ID' } | { code: 'EMPTY_MEMBER_LIST' } | MessagePropagationError
  > {
    const { groupId } = data;

    if (!data || data.members?.length === 0) {
      return errored({
        code: 'EMPTY_MEMBER_LIST'
      });
    }

    if (!groupId) {
      return errored({
        code: 'MISSING_GROUP_ID'
      });
    }

    const message = buildMessage(data);

    return propagateMessage(client, groupId, NotificationType.MEMBERS_ROLES_CHANGED, message);
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
    content += `\n[+${
      members.length - 10
    } more changes](https://wiseoldman.net/groups/${groupId}?dialog=group-activity)`;
  }

  const title = `${members.length} Member ${members.length === 1 ? 'role' : 'roles'} changed`;

  return new EmbedBuilder()
    .setColor(config.visuals.blue)
    .setURL(`https://wiseoldman.net/groups/${groupId}?dialog=group-activity`)
    .setTitle(title)
    .setDescription(content);
}

export default new MembersRolesChanged();
