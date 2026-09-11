// Next 16 defaults to Turbopack, which ignores the `webpack` config in next.config.js.
// Default to webpack and opt into Turbopack via TURBOPACK, matching the pre-16 behaviour
// and the TURBOPACK check in next.config.js. The flag is always passed explicitly because
// Next fails the build if a `webpack` config is present without one.
const { spawnSync } = require('child_process');

const bundlerFlag = process.env.TURBOPACK ? '--turbopack' : '--webpack';
const nextBin = require.resolve('next/dist/bin/next', {
  paths: [process.cwd()],
});

const { status } = spawnSync(
  process.execPath,
  [nextBin, 'build', bundlerFlag],
  {
    stdio: 'inherit',
  }
);

process.exit(status ?? 1);
