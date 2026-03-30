import "dotenv/config";
import express from "express";
import path from "node:path";
import { createSyachoApp } from "./app";
import { logError, logInfo } from "./lib/logger";

type GobbletApiModule = {
    createGobbletApp: () => express.Express;
    initializeGobbletApp?: () => Promise<void>;
};

function resolveProjectPath(...segments: string[]) {
    return path.resolve(__dirname, "..", "..", ...segments);
}

function sendSpaIndex(indexFilePath: string, res: express.Response) {
    res.sendFile(indexFilePath);
}

async function loadGobbletApiModule(): Promise<GobbletApiModule> {
    const gobbletAppModulePath = resolveProjectPath(
        "apps",
        "Gobblet-gobblers",
        "api",
        "dist",
        "app.js",
    );

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(gobbletAppModulePath) as GobbletApiModule;
}

async function startUnifiedServer() {
    const app = express();
    const port = Number(process.env.PORT ?? 8080);

    const syachoWebDistPath = resolveProjectPath("web", "dist");
    const syachoWebIndexPath = path.join(syachoWebDistPath, "index.html");
    const gobbletWebDistPath = resolveProjectPath("apps", "Gobblet-gobblers", "web", "dist");
    const gobbletWebIndexPath = path.join(gobbletWebDistPath, "index.html");

    const gobbletApi = await loadGobbletApiModule();
    if (gobbletApi.initializeGobbletApp) {
        await gobbletApi.initializeGobbletApp();
    }

    app.disable("x-powered-by");

    app.get("/health", (_req, res) => {
        res.json({ status: "ok" });
    });

    app.use("/api", createSyachoApp());
    app.use("/gobblet/api", gobbletApi.createGobbletApp());

    app.get("/gobblet", (_req, res) => {
        res.redirect(301, "/gobblet/");
    });

    app.use("/gobblet", express.static(gobbletWebDistPath));
    app.get("/gobblet/*", (_req, res) => {
        sendSpaIndex(gobbletWebIndexPath, res);
    });

    app.use(express.static(syachoWebDistPath));
    app.get("*", (_req, res) => {
        sendSpaIndex(syachoWebIndexPath, res);
    });

    app.listen(port, () => {
        logInfo("unified server started", { port });
        console.log(`Unified server running on port ${port}`);
    });
}

if (require.main === module) {
    startUnifiedServer().catch((error) => {
        logError("failed to start unified server", { err: String(error) });
        process.exit(1);
    });
}
