import '@testing-library/jest-dom';

// Jest 27 + jsdom does not provide Web Crypto here by default.
// The shared toast uses uuid, which needs crypto.getRandomValues() in tests.
Object.defineProperty(globalThis, 'crypto', {
  value: require('crypto').webcrypto,
});
