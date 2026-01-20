import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL ?? '';
const needsSsl = process.env.PRISMA_SSL === '1';
const url = needsSsl ? `${databaseUrl}?sslmode=require` : databaseUrl;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url,
  },
});
