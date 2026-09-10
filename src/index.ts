import { env } from "./config/env";
import { connectDb } from "./config/db";
import { app } from "./app";
import { startWorkers } from "./workers";

async function main(): Promise<void> {
  await connectDb();
  await startWorkers();
  app.listen(env.PORT, () => {
    console.log(`SELLlIX API listening on http://localhost:${env.PORT}`);
    console.log(`Health: http://localhost:${env.PORT}/api/health`);
    console.log(`Docs:   http://localhost:${env.PORT}/api/docs`);
  });
}

void main().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
