// jest-environment-jsdom bootstraps jsdom via native Node require() before
// Jest's module sandbox (and thus moduleNameMapper) is active. jsdom tries to
// require('canvas') and if the native binary is missing it throws. We
// pre-populate Node's require cache with a minimal stub here, at
// native-require time, so jsdom receives the pieces it expects.
const createCanvasStub = () => ({
  getContext: () => null,
  toBuffer: () => Buffer.alloc(0),
  toDataURL: () => '',
});

class ImageStub {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this._src = '';
  }

  set src(value) {
    this._src = value;

    if (typeof this.onload === 'function') {
      this.onload();
    }
  }

  get src() {
    return this._src;
  }
}

const canvasStub = {
  Canvas: createCanvasStub,
  Image: ImageStub,
  createCanvas: createCanvasStub,
};

try {
  const canvasPath = require.resolve('canvas');
  if (!require.cache[canvasPath]) {
    require.cache[canvasPath] = {
      id: canvasPath,
      filename: canvasPath,
      loaded: true,
      exports: canvasStub,
    };
  }
} catch (_) {
  // canvas is not resolvable at all, nothing to stub
}

const JSDOMEnvironment = require('jest-environment-jsdom');
const { TextDecoder, TextEncoder } = require('util');

// jsdom does not expose TextEncoder/TextDecoder, but @sentry/nextjs's server
// build (resolved via the node export condition) uses them at import time.
class CanvasStubEnvironment extends (JSDOMEnvironment.TestEnvironment ||
  JSDOMEnvironment) {
  constructor(...args) {
    super(...args);
    this.global.TextEncoder ??= TextEncoder;
    this.global.TextDecoder ??= TextDecoder;
  }
}

module.exports = CanvasStubEnvironment;
module.exports.TestEnvironment = CanvasStubEnvironment;
