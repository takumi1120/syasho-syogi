import { PrismaClient } from "../../generated/syasho-client";

const globalForPrisma = globalThis as typeof globalThis & {
    syashoPrisma?: PrismaClient;
};

export const db =
    globalForPrisma.syashoPrisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.syashoPrisma = db;
}
