import { Client } from 'discord.js';

export interface Event {
  type: string;
  execute(data: unknown, client: Client): Promise<void>;
}
