export function notFound(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error, req, res, next) {
  console.error('[API ERROR]', error);
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;
  res.status(status).json({ message });
}
