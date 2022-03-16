const withPlugins = require('next-compose-plugins');
const withTranspileModules = require('next-transpile-modules');

const { parsed: env } = require('dotenv').config({
  path: '.env.kesaseteli',
});

const nextConfig = (override) => ({
  env,
  poweredByHeader: false,
  swcMinify: true,
  compiler: {
    styledComponents: true,
    showConfig: true,
  },
  experimental: {
    externalDir: true,
    outputStandalone: true
  },
  ...override,
});

const plugins = [
  [withTranspileModules, { transpileModules: ['@frontend'] }],
];

module.exports = (override) => withPlugins(plugins, nextConfig(override));
