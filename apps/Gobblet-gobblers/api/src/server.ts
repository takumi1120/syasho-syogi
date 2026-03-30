import "dotenv/config";
import { logError } from "./lib/logger";
import { config } from "./lib/config";
import { createGobbletApp, initializeGobbletApp } from "./app";

export async function startGobbletServer() {
    const port = Number(process.env.PORT ?? config.port);

    await initializeGobbletApp();

    const app = createGobbletApp();
    app.listen(port, "0.0.0.0", () => {
        console.log(`API listening on: http://localhost:${port}`);
    });
}

if (require.main === module) {
    startGobbletServer().catch((error) => {
        logError("failed to start gobblet server", { err: String(error) });
        process.exit(1);
    });
}
