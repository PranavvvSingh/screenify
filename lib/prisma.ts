import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Get CA certificate: prefer file (local dev), fall back to env var (Vercel)
const caPath = path.join(process.cwd(), "certs/ca.pem");
const caExists = fs.existsSync(caPath);

function getCaCertificate(): string {
  // Local development: read from file
  if (caExists) {
    return fs.readFileSync(caPath).toString();
  }
  // Production (Vercel): decode from base64 env var
  if (process.env.DATABASE_CA_CERT) {
    return Buffer.from(process.env.DATABASE_CA_CERT, "base64").toString("utf-8");
  }
  throw new Error("No CA certificate found. Set DATABASE_CA_CERT env var or provide certs/ca.pem");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: true,
    ca: getCaCertificate(),
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
