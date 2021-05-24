const getBackendUrl = (): string =>
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default getBackendUrl;
