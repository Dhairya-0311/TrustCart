import { Queue, Worker, QueueEvents } from 'bullmq';
import { createBullMQConnection } from './redis';

// Queue name constant
export const ANALYSIS_QUEUE_NAME = 'analysis-queue';

// Create the analysis queue
let analysisQueue: Queue | null = null;

export function getAnalysisQueue(): Queue {
  if (!analysisQueue) {
    analysisQueue = new Queue(ANALYSIS_QUEUE_NAME, {
      connection: createBullMQConnection() as any,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 86400, // 24 hours
          count: 100,
        },
        removeOnFail: {
          age: 172800, // 48 hours
        },
      },
    });

    console.log('✅ BullMQ analysis queue initialized');
  }

  return analysisQueue;
}

// Create queue events listener (for monitoring)
let queueEvents: QueueEvents | null = null;

// Create queue events
export function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    queueEvents = new QueueEvents(ANALYSIS_QUEUE_NAME, {
      connection: createBullMQConnection() as any,
    });
  }
  return queueEvents;
}

// Create a worker (used in worker process)
export function createAnalysisWorker(
  processor: (job: any) => Promise<any>
): Worker {
  const worker = new Worker(ANALYSIS_QUEUE_NAME, processor, {
    connection: createBullMQConnection() as any,
    concurrency: 3,
    stalledInterval: 30000, // 30s stalled check
    limiter: {
      max: 10,
      duration: 60000, // Max 10 jobs per minute
    },
  });

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`⚠️ Job ${jobId} stalled`);
  });

  return worker;
}
