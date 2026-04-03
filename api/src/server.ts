import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

// --- syasho-syogi routes ---
import syashoRoomsRouter from "./syasho-syogi/routes/rooms";
import syashoGamesRouter from "./syasho-syogi/routes/games";
import syashoUsersRouter from "./syasho-syogi/routes/users";
import syashoResultsRouter from "./syasho-syogi/routes/results";

// --- gobblet-gobblers routes ---
import gobbletUsersRouter from "./gobblet-gobblers/routes/users";
import gobbletCharactersRouter from "./gobblet-gobblers/routes/characters";
import gobbletResultRouter from "./gobblet-gobblers/routes/result";
import gobbletOnlineRouter from "./gobblet-gobblers/routes/online";
import { seedCharacters } from "./gobblet-gobblers/lib/InitSeed";

const app = express();
const port = Number(process.env.PORT ?? 3000);

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

function isAllowedOrigin(origin: string) {
    if (allowedOrigins.includes(origin)) return true;
    if (process.env.NODE_ENV === "production") return false;
    try {
        const url = new URL(origin);
        return url.protocol.startsWith("http") && ["localhost", "127.0.0.1"].includes(url.hostname);
    } catch {
        return false;
    }
}

app.use(express.json());
app.use(
    cors({
        origin(origin, callback) {
            if (!origin || isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`CORS blocked for origin: ${origin}`));
        },
    }),
);

// --- Logging ---
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// --- Health check ---
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// --- syasho-syogi API: /syasho-syogi/* ---
const syashoRouter = express.Router();
syashoRouter.get("/", (_req, res) => res.send("syasho-syogi ok"));
syashoRouter.use("/users", syashoUsersRouter);
syashoRouter.use("/results", syashoResultsRouter);
syashoRouter.use("/rooms", syashoRoomsRouter);
syashoRouter.use("/games", syashoGamesRouter);
app.use("/syasho-syogi", syashoRouter);

// --- gobblet-gobblers API: /gobblet-gobblers/* ---
const gobbletRouter = express.Router();
gobbletRouter.get("/", (_req, res) => res.send("gobblet-gobblers ok"));
gobbletRouter.use("/users", gobbletUsersRouter);
gobbletRouter.use("/characters", gobbletCharactersRouter);
gobbletRouter.use("/results", gobbletResultRouter);
gobbletRouter.use("/online", gobbletOnlineRouter);
app.use("/gobblet-gobblers", gobbletRouter);

// --- Root ---
app.get("/", (_req, res) => {
    res.json({
        apps: ["/syasho-syogi", "/gobblet-gobblers"],
        status: "ok",
    });
});

// --- Error handler ---
app.use((err: unknown, _req: Request, res: Response, _next: unknown) => {
    console.error("unexpected error:", err);
    res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" },
    });
});

// --- Start ---
async function start() {
    try {
        await seedCharacters();
        app.listen(port, "0.0.0.0", () => {
            console.log(`Unified API listening on: http://localhost:${port}`);
            console.log(`  /syasho-syogi/*`);
            console.log(`  /gobblet-gobblers/*`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
