/**
 * middleware/errorHandler.js
 * Central error handler.
 *
 * Every error in the app (a thrown error or one passed with next(error))
 * ends up here, so all error responses share one consistent JSON format.
 * Express knows this is an error handler because it takes four arguments.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed JSON in the request body (thrown by express.json())
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
    });
  }

  // Request body larger than the 10kb limit set in index.js
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body is too large',
    });
  }

  // Use the status set where the error was created, otherwise 500
  const statusCode = err.statusCode || err.status || 500;

  // Log server errors so they can be investigated
  if (statusCode >= 500) {
    console.error(err);
  }

  const response = {
    // Hide internal details of unexpected errors from clients
    error: statusCode >= 500 ? 'Internal Server Error' : err.message,
  };

  // In development, include the stack trace to help with debugging
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
