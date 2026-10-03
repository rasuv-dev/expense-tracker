export const errorHandler = (err, req, res, next) => {
  // If the response has already been sent, pass the error to Express
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  // Handle invalid MongoDB IDs
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Handle duplicate values
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists";
  }

  // Do not expose internal server error details
  if (statusCode >= 500) {
    message = "Internal Server Error";
    console.error(err);
  }

  const response = {
    success: false,
    message: message,
  };

  // Include validation details when available
  if (err.errors) {
    response.errors = err.errors;
  }

  return res.status(statusCode).json(response);
};
