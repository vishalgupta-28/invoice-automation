import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

function getNormalizedDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not configured.");
  }

  // Vercel UI can accidentally persist trailing spaces or line breaks.
  // Normalize without altering valid URL characters.
  const normalized = raw.replace(/[\r\n]+/g, "").trim();
  if (!normalized) {
    throw new Error("DATABASE_URL is empty after normalization.");
  }

  return normalized;
}

function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}

export function getPrismaClient(): PrismaClient {
  const databaseUrl = getNormalizedDatabaseUrl();

  if (process.env.NODE_ENV === "production") {
    if (!prismaClient) {
      prismaClient = createPrismaClient(databaseUrl);
    }
    return prismaClient;
  }

  if (!global.prisma) {
    global.prisma = createPrismaClient(databaseUrl);
  }

  return global.prisma;
}
