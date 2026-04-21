const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');
const { initDb } = require('./config/db');

// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Body parser
app.use(express.json({ limit: '10kb' }));

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Global Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again in 15 minutes',
});
app.use('/api', limiter);

// API Documentation (Swagger)
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize Database
initDb();

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Health check endpoint
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Returns server status
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'up',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// Handling unhandled routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    errors: err.errors || []
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
