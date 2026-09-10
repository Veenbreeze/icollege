import Knex from 'knex';
import { env } from '../config/env.js';

export const db = Knex({
  client: 'pg',
  connection: env.databaseUrl,
});
