const nextConfig = require('../../next.config');
const { withKesaseteliSecurityHeaders } = require('../shared/src/config/csp');
const { i18n } = require('./next-i18next.config');
const { parsed: env } = require('dotenv').config({
  path: '../../../.env.kesaseteli-youth',
});
module.exports = withKesaseteliSecurityHeaders(nextConfig({ i18n, env }));
