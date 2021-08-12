const webpack = require('webpack');
const path = require('path');
const withPlugins = require('next-compose-plugins');
const withCustomBabelConfig = require('next-plugin-custom-babel-config');
const withTranspileModules = require('next-transpile-modules');
const { i18n } = require('./next-i18next.config');

const { parsed: env } = require('dotenv').config({
  path: '../../../.env.kesaseteli',
});

const nextConfig = {
  i18n,
  webpack: (config, { dev, isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      config.node = {
        fs: 'empty',
      };
    }
    const tsLoader = config.module.rules.find(
      (rule) => rule.test && rule.test.test(/\.(ts|tsx)$/)
    );
    if (tsLoader) {
      tsLoader.use = {
        ...tsLoader.use,
        loader: 'next-babel-loader',
        options: {
          loader: 'ts',
          target: 'es2017',
        },
      };
      tsLoader.include.push(path.resolve('../../'));
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
