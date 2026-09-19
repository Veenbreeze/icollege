import multer from 'multer';

export function errorHandler(err, req, res, _next) {
  console.error(err);
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    return res.status(413).json({ error: message });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || 'Internal server error' });
}

export class HttpError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}
