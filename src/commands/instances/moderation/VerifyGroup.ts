import {
  CommandInteraction,
  GuildChannelManager,
  GuildMember,
  MessageEmbed,
  TextChannel
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { verify } from '../../../api/modules/groups';
import { Group } from '../../../api/types';
import config from '../../../config';
import { Command, ParsedMessage } from '../../../types';
import { getEmoji, hasModeratorRole } from '../../../utils';
import CommandError from '../../CommandError';

const CHAT_MESSAGE = (groupName: string) =>
  `${getEmoji('success')} \`${groupName}\` has been successfully verified!`;

const LOG_MESSAGE = (groupId: number, groupName: string, userId: string) =>
  `${groupName} (${groupId}) - <@${userId}>`;

class VerifyGroup implements Command {
  name: string;
  template: string;
  slashCommand: SlashCommandBuilder;

  constructor() {
    this.name = 'Set a group as verified.';
    this.template = '!verify-group {groupId} {userTag}';
    this.slashCommand = new SlashCommandBuilder()
      .addIntegerOption(option => option.setName('id').setDescription('Group id').setRequired(true))
      .addUserOption(option =>
        option.setName('user').setDescription('Discord user tag').setRequired(true)
      )
      .setName('verify-group')
      .setDescription('Set a group as verified');
  }

  activated(message: ParsedMessage) {
    return (
      message.command === 'verify-group' &&
      message.args.length >= 2 &&
      message.sourceMessage?.guild?.id === config.discord.guildId
    );
  }

  async execute(message: ParsedMessage | CommandInteraction) {
    if (message instanceof CommandInteraction) {
      if (!hasModeratorRole(message.member as GuildMember)) {
        message.reply({ content: 'Nice try. This command is reserved for Moderators and Admins.' });
        return;
      }
      const groupId = message.options.getInteger('id', true);
      const userId = message.options.getUser('user', true).id;
      const user = message.guild?.members.cache.find(m => m.id === userId);

      if (!user) throw new CommandError('Failed to find user from tag.');

      try {
        const group = await verify(groupId);

        // Respond on the WOM discord chat with a success status
        const response = new MessageEmbed()
          .setColor(config.visuals.green)
          .setDescription(CHAT_MESSAGE(group.name));

        message.reply({ embeds: [response] });

        this.sendConfirmationLog(message.guild?.channels, group, userId);
        this.addRole(user);
      } catch (error) {
        throw new CommandError('Failed to verify group.');
      }
    } else {
      throw new CommandError(
        'This command has been changed to a slash command!',
        'Try /verify-group {id} {user}'
      );
    }
  }

  addRole(user: GuildMember) {
    user.roles.add(config.discord.roles.groupLeader).catch(console.log);
  }

  sendConfirmationLog(channels: GuildChannelManager | undefined, group: Group, userId: string) {
    const leadersLogChannel = channels?.cache.get(config.discord.channels.leadersLog);

    if (!leadersLogChannel) return;
    if (!((channel): channel is TextChannel => channel.type === 'GUILD_TEXT')(leadersLogChannel)) return;

    leadersLogChannel.send(LOG_MESSAGE(group.id, group.name, userId));
  }

  getGroupId(message: ParsedMessage): number | null {
    const match = message.args.find(a => a !== 'group' && !isNaN(Number(a)));
    return match ? parseInt(match, 10) : null;
  }

  getUserId(message: ParsedMessage): string | undefined {
    return message.args.find(a => a.startsWith('<@') && a.endsWith('>'))?.replace(/\D/g, '');
  }

  getMember(message: ParsedMessage, userId: string | undefined): GuildMember | undefined {
    if (!userId) return undefined;
    return message.sourceMessage.guild?.members.cache.find(m => m.id === userId);
  }
}

export default new VerifyGroup();
