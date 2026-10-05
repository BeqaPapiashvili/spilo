import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL environment variable is required in production");
    }
    return "mysql://root:@127.0.0.1:3306/spilo_db";
  }
  return url;
}

const connectionString = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaMariaDb(connectionString),
  });
}

function clientHasWarehouse(client: PrismaClient) {
  return typeof (client as PrismaClient & { warehouse?: { findMany?: unknown } }).warehouse?.findMany === "function";
}

const cached = globalForPrisma.prisma;
const prismaClient = cached && clientHasWarehouse(cached) ? cached : createPrismaClient();
globalForPrisma.prisma = prismaClient;

export const prisma = prismaClient;

export function getPrismaClient(): PrismaClient {
  return prisma;
}
