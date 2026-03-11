// jest-environment-jsdom bootstraps jsdom via native Node require() before
// Jest's module sandbox (and thus moduleNameMapper) is active. jsdom tries to
// require('canvas') and if the native binary is missing it throws. We
// pre-populate Node's require cache with a stub here, at native-require time,
// so jsdom receives an empty object instead of crashing.
try {
  const canvasPath = require.resolve('canvas');
  if (!require.cache[canvasPath]) {
    require.cache[canvasPath] = {
      id: canvasPath,
      filename: canvasPath,
      loaded: true,
      exports: {},
    };
  }
} catch (_) {
  // canvas is not resolvable at all, nothing to stub
}

module.exports = require('jest-environment-jsdom');
