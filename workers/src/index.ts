import { GdeltWorker, FbiWorker, OsceWorker, AdlHeatWorker } from "@mishmarot/ingestion";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

async function main() {
  console.log("Starting Mishmarot ingestion workers...");

  const workers = [
    new GdeltWorker(REDIS_URL),
    new FbiWorker(REDIS_URL),
    new OsceWorker(REDIS_URL),
    new AdlHeatWorker(REDIS_URL),
  ];

  // Register cron schedules
  for (const worker of workers) {
    await worker.registerCron();
  }

  console.log(`${workers.length} workers registered and running.`);

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down workers...");
    await Promise.all(workers.map((w) => w.shutdown()));
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
