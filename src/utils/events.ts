import { AsyncResult } from '@attio/fetchable';
import { Client } from 'discord.js';

export interface Event {
  type: string;
  execute(data: unknown, client: Client): AsyncResult<true, unknown>;
}
