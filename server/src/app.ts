import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  // Security & Middleware
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: '*', // Allow all origins for dev and Docker deployments
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static directory for uploaded receipts
  app.use('/uploads', express.static(config.uploadDir));

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
