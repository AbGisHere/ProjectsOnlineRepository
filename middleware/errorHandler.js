// Centralized error handler. Any controller that throws or calls next(err)
// ends up here. Keeps error shape consistent across the whole API.

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  // Oracle unique-constraint / FK violations -> friendlier messages.
  let message = err.message || 'Internal server error';
  if (err.errorNum === 1) message = 'A record with the same unique value already exists.';
  if (err.errorNum === 2291) message = 'Referenced record does not exist (foreign key violation).';
  if (err.errorNum === 2292) message = 'Cannot delete/update: record is referenced by other rows.';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = { ApiError, notFound, errorHandler };
