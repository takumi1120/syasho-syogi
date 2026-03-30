import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const syachoDatabaseUrl = process.env.SYACHO_DATABASE_URL ?? process.env.DATABASE_URL;

console.log("SYACHO_DATABASE_URL =", syachoDatabaseUrl);

const globalForPrisma = globalThis as typeof globalThis & {
    syachoPrisma?: PrismaClient;
};

export const db =
    globalForPrisma.syachoPrisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
        datasources: syachoDatabaseUrl
            ? {
                db: {
                    url: syachoDatabaseUrl,
                },
            }
            : undefined,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.syachoPrisma = db;
}
