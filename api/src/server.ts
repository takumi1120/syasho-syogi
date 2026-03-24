import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { logInfo, logError } from "./lib/logger";
import { config } from "./lib/config";
import roomsRouter from "./routes/rooms";
import gamesRouter from "./routes/games";
import usersRouter from "./routes/users";




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
app.use("/users", usersRouter);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.get("/stats-direct", (_req, res) => {
    res.json({ ok: true });
});

app.use("/rooms", roomsRouter);
app.use("/games", gamesRouter);
app.use((err: unknown, _req: Request, res: Response, _next: unknown) => {
    logError("unexpected error", { err: String(err) });
    res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" },
    });
});

app.listen(port, () => {
    logInfo("server started", { port });
    console.log(`Server running on port ${port}`);
});