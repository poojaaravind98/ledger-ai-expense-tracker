import { createApp } from './app';
import { config } from './config/env';
import { logger } from './utils/logger';

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`=====================================================`);
  logger.info(`  🚀 LEDGER AI EXPENSE TRACKER BACKEND API RUNNING  `);
  logger.info(`  📡 Port: http://localhost:${config.port}`);
  logger.info(`  🔗 Health Check: http://localhost:${config.port}/api/health`);
  logger.info(`  🧠 LLM Mode: ${config.llmProvider.toUpperCase()}`);
  logger.info(`  📂 Environment: ${config.nodeEnv}`);
  logger.info(`=====================================================`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});
