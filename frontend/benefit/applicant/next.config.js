const webpack = require('webpack');
const path = require('path');
const withPlugins = require('next-compose-plugins');
const withCustomBabelConfig = require('next-plugin-custom-babel-config');
const withTranspileModules = require('next-transpile-modules');

const { parsed: env } = require('dotenv').config({
  path: '../../../.env.benefit',
});

const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      };
    }
    const babelRule = config.module.rules.find((rule) =>
      rule.use && Array.isArray(rule.use)
        ? rule.use.find((u) => u.loader === 'next-babel-loader')
        : rule.use.loader === 'next-babel-loader'
    );
    if (babelRule) {
      babelRule.include.push(path.resolve('../../'));
    }
    config.plugins.push(new webpack.IgnorePlugin(/\/(__tests__|test)\//));
    config.module.rules.push({
      test: /\.test.tsx$/,
      loader: 'ignore-loader',
    });
    config.plugins.push(new webpack.EnvironmentPlugin(env));
    return config;
  },
};

const plugins = [
  [withTranspileModules, { transpileModules: ['@frontend'] }],
  [
    withCustomBabelConfig,
    { babelConfigFile: path.resolve('../../babel.config.js') },
  ],
];

module.exports = withPlugins(plugins, nextConfig);
