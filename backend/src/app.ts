import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import ibmDocsRoutes from './modules/ibm-docs/ibm-docs.routes';

// Create Express app
const app: Application = express();

// Connect to database
connectDatabase().catch((error) => {
  logger.error('Failed to connect to database:', error);
  process.exit(1);
});

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    message: 'Prospecting Board API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// IBM Documentation routes
app.use('/api/ibm-docs', ibmDocsRoutes);

// Placeholder routes for future implementation
app.get('/api/v1/customers', (_req: Request, res: Response) => {
  res.json({
    message: 'Customers endpoint - to be implemented',
    data: [],
  });
});

app.get('/api/v1/research', (_req: Request, res: Response) => {
  res.json({
    message: 'Research endpoint - to be implemented',
    data: [],
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

// Made with Bob
