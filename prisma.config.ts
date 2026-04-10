import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use direct URL for migrations — PgBouncer (pooler) runs in transaction mode
    // which can cause issues with DDL statements during migrations
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
