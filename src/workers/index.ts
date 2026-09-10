import { env, isTest } from "../config/env";
import {
  runCompetitorSync,
  runMarketUpdate,
  runNotificationCheck,
  runProductSync,
  runSubscriptionSync,
  runTrackerUpdate,
} from "./jobs";

const INTERVAL_MS = 15 * 60 * 1000;
const timers: NodeJS.Timeout[] = [];

async function tick(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    if (env.NODE_ENV === "development") {
      console.log(`[worker] ${name} tick`);
    }
  } catch (error) {
    console.warn(`[worker] ${name} failed`, error);
  }
}

export async function startWorkers(): Promise<void> {
  if (isTest) return;

  const jobs = [
    { name: "product-sync", fn: runProductSync },
    { name: "competitor-sync", fn: runCompetitorSync },
    { name: "tracker-update", fn: runTrackerUpdate },
    { name: "market-update", fn: runMarketUpdate },
    { name: "notification-check", fn: runNotificationCheck },
    { name: "subscription-sync", fn: runSubscriptionSync },
  ];

  if (env.REDIS_URL) {
    try {
      const { Queue, Worker } = await import("bullmq");
      const connection = { url: env.REDIS_URL };
      for (const job of jobs) {
        const queue = new Queue(job.name, { connection });
        await queue.add(job.name, {}, { repeat: { every: INTERVAL_MS } });
        const worker = new Worker(job.name, async () => tick(job.name, job.fn), { connection });
        worker.on("error", (err) => console.warn(`[worker] ${job.name} redis error`, err.message));
      }
      console.log("[worker] BullMQ workers started");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      console.warn(`[worker] Redis/BullMQ unavailable (${message}) — using in-process intervals`);
    }
  }

  for (const job of jobs) {
    timers.push(setInterval(() => void tick(job.name, job.fn), INTERVAL_MS));
  }
  console.log("[worker] In-process interval workers started");
}

export function stopWorkers(): void {
  for (const timer of timers) clearInterval(timer);
}
