const webpack = require('webpack');
const path = require('path');
const withPlugins = require('next-compose-plugins');
const withCustomBabelConfig = require('next-plugin-custom-babel-config');
const withTranspileModules = require('next-transpile-modules');
const { i18n } = require('./next-i18next.config');

const { parsed: env } = require('dotenv').config({
  path: '../../../.env.tet',
});

const nextConfig = {
  i18n,
  env,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: require.resolve('path-browserify'),
    };
    const babelRule = config.module.rules.find((rule) =>
      Array.isArray(rule.use)
        ? rule.use.find((u) => u.loader?.match(/next.*babel.*loader/i))
        : rule.use?.loader?.match(/next.*babel.*loader/i),
    );
    if (babelRule) {
      babelRule.include.push(path.resolve('../../'));
    }
    config.plugins.push(new webpack.IgnorePlugin(/\/(__tests__|test)\//));
    config.module.rules.push({
      test: /\.test.tsx$/,
      loader: 'ignore-loader',
    });
    return config;
  },
};

const plugins = [
  [withTranspileModules, { transpileModules: ['@frontend'] }],
  [withCustomBabelConfig, { babelConfigFile: path.resolve('../../babel.config.js') }],
];

module.exports = withPlugins(plugins, nextConfig);
