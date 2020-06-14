import { Message, StringResolvable } from 'discord.js';

export interface Command {
  name: string;
  template: string;
  requiresAdmin?: boolean;
  activated(message: ParsedMessage): boolean;
  execute(message: ParsedMessage): void;
}

export interface ParsedMessage {
  source: Message;
  prefix: string;
  command: string;
  args: string[];
  respond(response: StringResolvable): void;
}

export interface Competition {
  id: number;
  title: string;
  metric: string;
  score: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  duration?: string;
  groupId?: number;
  participantCount?: number;
}

export interface HiscoresResult {
  id: number;
  username: string;
  displayName: string;
  type: string;
  lastImportedAt?: string;
  registeredAt: string;
  updatedAt: string;
  rank: number;
  experience?: number;
  kills?: number;
  score?: number;
  level?: number;
}

export interface GainedResult {
  playerId: number;
  username: string;
  displayName: string;
  type: string;
  startDate: string;
  endDate: string;
  endValue: number;
  startValue: number;
  gained: number;
}

export interface RecordResult {
  playerId: number;
  username: string;
  displayName: string;
  type: string;
  value: number;
  updatedAt: string;
}

export interface TimeGap {
  seconds: number;
  minutes: number;
  hours: number;
  days: number;
}

export const enum TimePeriod {
  Second = 1000,
  Minute = 1000 * 60,
  Hour = 1000 * 60 * 60,
  Day = 1000 * 60 * 60 * 24,
  Month = 1000 * 60 * 60 * 24 * 31,
  Year = 1000 * 60 * 60 * 24 * 365
}

export enum MetricType {
  Skill = 'Skill',
  Boss = 'Boss',
  Activity = 'Activity'
}

export interface SkillResult {
  name: string;
  type: MetricType;
  rank: number;
  experience: number;
  level?: number;
}

export interface BossResult {
  name: string;
  type: MetricType;
  rank: number;
  kills: number;
}

export interface ActivityResult {
  name: string;
  type: MetricType;
  rank: number;
  score: number;
}

export type MetricResult = SkillResult | BossResult | ActivityResult;

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
  error = '❌'
}
