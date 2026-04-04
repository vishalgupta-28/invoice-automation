import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}

export function getPrismaClient(): PrismaClient {
  // Defer DATABASE_URL validation and Prisma initialization to runtime.
  // This prevents build-time module evaluation from failing on Vercel.
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (process.env.NODE_ENV === "production") {
    if (!prismaClient) {
      prismaClient = createPrismaClient();
    }
    return prismaClient;
  }

  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }

  return global.prisma;
}
