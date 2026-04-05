import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | undefined;

function normalizeConnectionUrl(rawValue: string): string {
  const normalized = rawValue.replace(/[\r\n]+/g, "").trim();
  if (!normalized) {
    throw new Error("Database URL is empty after normalization.");
  }

  try {
    const parsed = new URL(normalized);

    // Prisma/Postgres can fail with `channel_binding=require` in some environments.
    // Remove it to keep connectivity consistent across local + Vercel runtimes.
    parsed.searchParams.delete("channel_binding");

    // Ensure SSL is required for hosted Postgres providers like Neon.
    if (!parsed.searchParams.get("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    return parsed.toString();
  } catch {
    return normalized;
  }
}

function getNormalizedDatabaseUrl(): string {
  const directRaw = process.env.DIRECT_DATABASE_URL;
  if (directRaw) {
    return normalizeConnectionUrl(directRaw);
  }

  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const normalized = normalizeConnectionUrl(raw);

  // If user provided Neon pooler host, attempt a direct-host fallback automatically.
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname.includes("-pooler.")) {
      parsed.hostname = parsed.hostname.replace("-pooler.", ".");
      return parsed.toString();
    }
  } catch {
    // Fall through to normalized URL.
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
