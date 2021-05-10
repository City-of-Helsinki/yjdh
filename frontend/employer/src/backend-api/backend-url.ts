export const getBackendUrl = (): string =>
  process.env.BACKEND_URL || 'http://localhost:8000';
