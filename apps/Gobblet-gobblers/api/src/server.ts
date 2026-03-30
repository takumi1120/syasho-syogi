import "dotenv/config";
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
console.log("server imported resultRouter");

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cors({ origin: config.corsOrigin }));

app.use((req, _res, next) => {
    logInfo("request", { method: req.method, path: req.path });
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
    logError("unexpected error", { err: String(err) });
    res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" },
    });
});

async function start() {
    try {
        await seedCharacters();

        app.listen(port, "0.0.0.0", () => {
            console.log(`API listening on: http://localhost:${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();