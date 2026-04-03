import { PrismaClient } from "../../generated/gobblet-client";

const globalForPrisma = globalThis as typeof globalThis & {
    gobbletPrisma?: PrismaClient;
};

export const db =
    globalForPrisma.gobbletPrisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.gobbletPrisma = db;
}
