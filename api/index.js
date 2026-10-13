/**
 * index.js
 * Entry point of the structured backend API (INSY7314 ICE Task 2).
 *
 * Responsibilities of this file:
 *  1. Load environment variables from .env
 *  2. Create the Express app and register global middleware
 *     (controlled CORS and JSON body parsing)
 *  3. Define the root (/) and health (/health) routes
 *  4. Mount the book routes under /api/books
 *  5. Register the 404 handler and the central error handler (always last)
 *  6. Start the server on the configured port
 */

// Load variables from .env into process.env (quiet hides the dotenv start-up tip)
require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');

const bookRoutes = require('./routes/bookRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

/* ------------------------------------------------------------------
 * Controlled Cross-Origin Resource Sharing (CORS)
 * Only the front-end origins listed in ALLOWED_ORIGINS may call the API
 * from a browser. Requests with no Origin header (Postman, curl,
 * server-to-server) are allowed so the API can be tested.
 * ------------------------------------------------------------------ */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // No Origin header (Postman / curl) or an approved origin: allow
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Any other origin is blocked; the central error handler returns 403
    const error = new Error(`CORS policy: the origin ${origin} is not allowed`);
    error.statusCode = 403;
    return callback(error);
  },
  methods: ['GET', 'POST'], // only the methods this API exposes
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Parse JSON request bodies; the size limit guards against very large payloads
app.use(express.json({ limit: '10kb' }));

/* ------------------------------------------------------------------
 * Root and health routes
 * ------------------------------------------------------------------ */

// GET / - confirms the API is running and lists the available endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Secure MERN App Books API',
    endpoints: {
      health: 'GET /health',
      allBooks: 'GET /api/books',
      bookById: 'GET /api/books/:id',
      addBook: 'POST /api/books',
    },
  });
});

// GET /health - lightweight check that the server is up and responding
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* ------------------------------------------------------------------
 * API resource routes
 * ------------------------------------------------------------------ */
app.use('/api/books', bookRoutes);

/* ------------------------------------------------------------------
 * 404 handler - any route not matched above
 * ------------------------------------------------------------------ */
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/* ------------------------------------------------------------------
 * Central error handler - must be registered after all routes
 * ------------------------------------------------------------------ */
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
