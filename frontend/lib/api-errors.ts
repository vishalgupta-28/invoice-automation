import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("can't reach database server") || message.includes("cant reach database server");
  }

  return false;
}

export function handleDatabaseError(error: unknown, fallbackMessage: string): NextResponse | null {
  if (!isDbConnectionError(error)) {
    return null;
  }

  const databaseUrl = process.env.DATABASE_URL;
  let target = "configured database";
  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      const dbName = parsed.pathname.replace("/", "");
      const schema = parsed.searchParams.get("schema");
      target = `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}/${dbName}${schema ? ` (schema: ${schema})` : ""}`;
    } catch {
      target = "configured database";
    }
  }

  return NextResponse.json(
    {
      error: `Database unavailable at ${target}. Check DATABASE_URL and connectivity, then run \`npx prisma db push\` in /frontend.`,
      details: fallbackMessage
    },
    { status: 503 }
  );
}
