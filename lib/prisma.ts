import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: true, // Neon requires SSL; connection string already includes sslmode=require
  // Keep pool small — each serverless instance creates its own pool
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    transactionOptions: {
      maxWait: 10000, // Max time to acquire a connection (10s)
      timeout: 30000, // Max transaction duration (30s)
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
