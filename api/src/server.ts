import "dotenv/config";
import { logInfo, logError } from "./lib/logger";
import { config } from "./lib/config";
import { createSyachoApp } from "./app";

export function startSyachoServer() {
    const app = createSyachoApp();
    const port = Number(process.env.PORT ?? config.port);

    app.listen(port, () => {
        logInfo("server started", { port });
        console.log(`Server running on port ${port}`);
    });
}

if (require.main === module) {
    try {
        startSyachoServer();
    } catch (error) {
        logError("failed to start syacho server", { err: String(error) });
        process.exit(1);
    }
}
