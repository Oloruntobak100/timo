/**
 * Phillips Data Stream - Express Server
 * Main entry point for the backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Middleware
const { entityDetectionMiddleware } = require('./middleware/entityDetection');

// Routes
const companyRoutes = require('./routes/companies');
const dashboardRoutes = require('./routes/dashboard');
const jobRoutes = require('./routes/jobs');
const clientRoutes = require('./routes/clients');
const invoiceRoutes = require('./routes/invoices');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.xero.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Entity detection middleware - MUST be before routes
app.use(entityDetectionMiddleware);

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Phillips Data Stream API is running',
    timestamp: new Date().toISOString(),
    company: req.company ? {
      id: req.company.id,
      name: req.company.shortName,
    } : null,
  });
});

// Company routes
app.use('/api/companies', companyRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);

// Client routes
app.use('/api/clients', clientRoutes);

// Invoice routes
app.use('/api/invoices', invoiceRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           PHILLIPS DATA STREAM API SERVER                    ║
║                                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}${' '.repeat(32 - (process.env.NODE_ENV || 'development').length)}║
║  Port: ${PORT}${' '.repeat(45)}║
║  URL: http://localhost:${PORT}${' '.repeat(33)}║
║                                                              ║
║  Entities:                                                   ║
║    • Phillips Construction (ID: 1)                          ║
║    • Phillips Barnes Environmental (ID: 2)                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
