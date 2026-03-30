import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const gobbletDatabaseUrl = process.env.GOBBLET_DATABASE_URL ?? process.env.DATABASE_URL;

console.log("GOBBLET_DATABASE_URL =", gobbletDatabaseUrl);

const globalForPrisma = globalThis as typeof globalThis & {
    gobbletPrisma?: PrismaClient;
};

export const db =
    globalForPrisma.gobbletPrisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
        datasources: gobbletDatabaseUrl
            ? {
                db: {
                    url: gobbletDatabaseUrl,
                },
            }
            : undefined,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.gobbletPrisma = db;
}
