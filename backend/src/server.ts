import createApplication from "./application.ts";
import PrinterService from "./routes/printer/service.ts";
import { connectDatabase, getDatabase } from "./database/database.ts";
import PrintSync3DConfig from "./config/config.ts";
import ModelService from "./routes/model/service.ts";
import getLoggingPrefix from "./util/logging.ts";

new PrintSync3DConfig();
new PrinterService();
new ModelService();

await connectDatabase();

const server = createApplication().listen(PrintSync3DConfig.PORT, () => {
  console.info(
    `%c✔ %cPrintSync3D service is up and running:\n ➥ API routes: http://localhost:${PrintSync3DConfig.PORT}/api`,
    "color: green",
    "color: blue, font-weight: bold",
  );

  PrinterService.refreshConnections();
});

const handleShutdown = async () => {
  console.info(
    `%c${getLoggingPrefix()} PrintSync3D is shutting down.`,
    "color: blue",
  );

  await getDatabase().write();

  server.close((error) => {
    console.error(
      "An error occurred while shutting downthe PrintSync3D server",
      error,
    );
  });

  Deno.exit();
};

server.on("close", handleShutdown);

const signals: Deno.Signal[] = ["SIGBREAK", "SIGINT", "SIGTERM"];

signals.forEach((signal) => {
  try {
    Deno.addSignalListener(signal, handleShutdown);
  } catch (_ignored) {
    // Error is thrown for SIGTERM on Windows.
  }
});
