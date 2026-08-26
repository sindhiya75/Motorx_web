/**
 * Centralized Error Handling Middleware for Express
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found - ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
