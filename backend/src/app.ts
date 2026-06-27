import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'express-async-errors';

import { env } from './config/env';
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware';
import { generalRateLimiter } from './middleware/rateLimit.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import analysisRoutes from './routes/analysis.routes';
import alertRoutes from './routes/alert.routes';

const app = express();

// ─── Security & Parsing Middleware ───

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Request Logging ─────────────────

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ───────────────────

app.use('/api/', generalRateLimiter);

// ─── Swagger API Docs ────────────────

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TrustCart API',
      version: '1.0.0',
      description:
        'AI-powered product authenticity & price comparison platform for Indian e-commerce.',
      contact: {
        name: 'TrustCart Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TrustCart API Docs',
}));

// ─── API Routes ──────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/analyses', analysisRoutes);
app.use('/api/v1/alerts', alertRoutes);

// ─── Root Route ──────────────────────

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'TrustCart API',
      version: '1.0.0',
      docs: '/api/v1/docs',
      health: '/api/v1/health',
    },
  });
});

// ─── Error Handling ──────────────────

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
