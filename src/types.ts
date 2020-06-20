import { Message, MessageAttachment, StringResolvable } from 'discord.js';
// import { Server } from './database';

export interface Command {
  name: string;
  template: string;
  requiresAdmin?: boolean;
  requiresGroup?: boolean;
  requiresPagination?: boolean;
  activated(message: ParsedMessage): boolean;
  execute(message: ParsedMessage): void;
}

export interface Event {
  type: string;
  execute(data: Object): void;
}

export interface EventPayload {
  type: string;
  data: Object;
}

export interface CanvasAttachment {
  attachment: MessageAttachment;
  fileName: string;
}

export interface Renderable {
  render(props: any): Promise<CanvasAttachment>;
}

export interface ParsedMessage {
  source: Message;
  prefix: string;
  command: string;
  args: string[];
  // server?: Server;
  respond(response: StringResolvable): void;
}

export interface TimeGap {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export enum Emoji {
  overall = '<:icon_Overall:720446212356177951>',
  attack = '<:icon_Attack:706462610840879146>',
  defence = '<:icon_Defence:706462611000000589>',
  strength = '<:icon_Strength:706462610916114483>',
  hitpoints = '<:icon_Hitpoints:706462611050332258>',
  ranged = '<:icon_Ranged:706462611222429796>',
  prayer = '<:icon_Prayer:706462610949931049>',
  magic = '<:icon_Magic:706462611243532330>',
  cooking = '<:icon_Cooking:706462611075629128>',
  woodcutting = '<:icon_Woodcutting:706462611205783562>',
  fletching = '<:icon_Fletching:706462611075629138>',
  fishing = '<:icon_Fishing:706462611415236618>',
  firemaking = '<:icon_Firemaking:706462611209977907>',
  crafting = '<:icon_Crafting:706462610920308761>',
  smithing = '<:icon_Smithing:706462610945736706>',
  mining = '<:icon_Mining:706462611134349413>',
  herblore = '<:icon_Herblore:706462611012583456>',
  agility = '<:icon_Agility:706462611121897483>',
  thieving = '<:icon_Thieving:706462611214172240>',
  slayer = '<:icon_Slayer:706462611222298654>',
  farming = '<:icon_Farming:706462611364904980>',
  runecrafting = '<:icon_Runecrafting:706462611327287347>',
  hunter = '<:icon_Hunter:706462611218366534>',
  construction = '<:icon_Construction:706462610853330986>',

  success = '✅',
  error = '❌',
  warning = '⚠️',
  tada = '🎉',
  wave = '👋',
  speaker = '📢',
  gold_medal = '🥇',
  silver_medal = '🥈',
  bronze_medal = '🥉',
  clock = '🕒'
}
