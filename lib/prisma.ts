import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Check if custom CA certificate exists (local development)
const caPath = path.join(process.cwd(), "certs/ca.pem");
const caExists = fs.existsSync(caPath);

const pool = new Pool({
  connectionString,
  ssl: caExists
    ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync(caPath).toString(),
      }
    : {
        rejectUnauthorized: false,
      },
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
