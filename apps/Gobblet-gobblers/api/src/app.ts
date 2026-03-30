import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import usersRouter from "./routes/users";
import charactersRouter from "./routes/characters";
import resultRouter from "./routes/result";
import { logInfo, logError } from "./lib/logger";
import { config } from "./lib/config";
import { seedCharacters } from "./lib/InitSeed";
import onlineRouter from "./routes/online";

export async function initializeGobbletApp() {
    await seedCharacters();
}

export function createGobbletApp() {
    const app = express();

    app.use(express.json());
    app.use(cors({ origin: config.corsOrigin }));

    app.use((req, _res, next) => {
        logInfo("request", { scope: "gobblet", method: req.method, path: req.path });
        next();
    });

    app.get("/", (_req, res) => {
        res.send("root ok");
    });

    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    app.get("/stats-direct", (_req, res) => {
        res.json({ ok: true });
    });

    app.use("/users", usersRouter);
    app.use("/characters", charactersRouter);
    app.use("/results", resultRouter);
    app.use("/online", onlineRouter);
    app.use((err: unknown, _req: Request, res: Response, _next: unknown) => {
        logError("unexpected error", { scope: "gobblet", err: String(err) });
        res.status(500).json({
            error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" },
        });
    });

    return app;
}
