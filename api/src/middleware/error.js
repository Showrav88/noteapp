import { HttpError } from '../utils/HttpError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err?.code === 11000) {
    res.status(409).json({ message: 'Email already in use' });
    return;
  }

  if (err?.name === 'CastError') {
    res.status(400).json({ message: 'Invalid id' });
    return;
  }

  const status = err instanceof HttpError ? err.status : (err.status ?? err.statusCode ?? 500);
  const message =
    err instanceof HttpError ? err.message : (err.message ?? 'Internal Server Error');

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}
