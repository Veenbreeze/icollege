import multer from 'multer';

export function errorHandler(err, req, res, _next) {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    return res.status(413).json({ error: message });
  }
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
  console.error(JSON.stringify({ requestId: req.id, method: req.method, path: req.path, status, error: err.name || 'Error', code: err.code }));
  res.status(status).json({ error: err.publicMessage || 'Internal server error', requestId: req.id });
}

export class HttpError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}
