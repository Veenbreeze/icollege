import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
dotenv.config({ path: path.join(backendRoot, '.env') });

/** @type {import('knex').Knex.Config} */
export default {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    directory: './migrations',
    extension: 'js',
  },
  seeds: {
    directory: './seeds',
    extension: 'js',
  },
};
