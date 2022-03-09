const webpack = require('webpack');
const path = require('path');
const withPlugins = require('next-compose-plugins');
const withCustomBabelConfig = require('next-plugin-custom-babel-config');
const withTranspileModules = require('next-transpile-modules');

const { parsed: env } = require('dotenv').config({
  path: '.env.kesaseteli',
});

const nextConfig = (override) => ({
  env,
  // swcMinify: true,
  compiler: {
  //  styledComponents: true,
  },
  experimental: {
   // externalDir: true,
   // outputStandalone: true
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: require.resolve('path-browserify'),
    };
    const babelRule = config.module.rules.find((rule) =>
      Array.isArray(rule.use)
        ? rule.use.find((u) => u.loader?.match(/next.*babel.*loader/i))
        : rule.use?.loader?.match(/next.*babel.*loader/i)
    );
    if (babelRule) {
      babelRule.include.push(path.resolve('../../'));
    }
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /\/(__tests__|test)\// })
    );
    config.module.rules.push({
      test: /\.test.tsx$/,
      loader: 'ignore-loader',
    });
    return config;
  },
  ...override,
});

const plugins = [
  [withTranspileModules, { transpileModules: ['@frontend'] }],
  [
    withCustomBabelConfig,
    { babelConfigFile: path.resolve('../../babel.config.js') },
  ],
];

module.exports = (override) => withPlugins(plugins, nextConfig(override));
