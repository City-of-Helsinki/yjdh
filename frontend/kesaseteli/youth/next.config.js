const nextConfig = require('../../next.config');
const { parsed: env } = require('dotenv').config({
  path: '../../../.env.kesaseteli-youth',
});
const config = nextConfig({ env });
const webpack = require('webpack');
const path = require('path');

const originalWebpack = config.webpack;
config.webpack = (webpackConfig, options) => {
  const c = originalWebpack ? originalWebpack(webpackConfig, options) : webpackConfig;
  
  // Use NormalModuleReplacementPlugin to surgically replace the global hooks
  // with our compatible versions whenever they are requested in the youth app.
  // This works even for relative imports inside the global shared package!
  const hooksToReplace = [
    'useLocale',
    'useGoToPage',
    'useErrorHandler',
    'useGetLanguage',
    'useRouterQueryParam',
    'useIsRouting'
  ];

  hooksToReplace.forEach(hook => {
    c.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        new RegExp(`frontend/shared/src/hooks/${hook}(\\.ts)?$`),
        path.resolve(__dirname, `../shared/src/hooks/${hook}.ts`)
      )
    );
  });

  return c;
};

module.exports = config;
