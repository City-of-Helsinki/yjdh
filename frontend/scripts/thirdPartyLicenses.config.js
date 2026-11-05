/**
 * Everything about the third-party license notices that is specific to this
 * repository. The generator itself comes from the license-notices package and
 * knows nothing about this project.
 *
 * The notices are written per app, into its `public` directory, by
 * `withThirdPartyLicenses` in the shared `next.config.js`.
 *
 * @type {import('@city-of-helsinki/license-notices/next').ThirdPartyLicensesConfig}
 */
const thirdPartyLicensesConfig = {
  repositoryUrl: 'https://github.com/City-of-Helsinki/yjdh',

  // The workspace packages are part of the application itself.
  firstPartyPackages: ['@frontend/*'],

  // Relative to each app's directory (frontend/<project>/<app>). The Docker
  // build context is `frontend`, so the repository root LICENSE is not
  // available there; frontend/LICENSE is a copy of it.
  projectLicenseFile: '../../LICENSE',

  licenseDecisions: {
    dompurify: {
      license: 'Apache-2.0',
      note:
        'Offered by its author under "(MPL-2.0 OR Apache-2.0)". This ' +
        'distribution elects Apache-2.0, so the MPL-2.0 obligations do not ' +
        'apply to this component.',
    },
    ibantools: {
      declared: 'MIT or MPL-2.0',
      license: 'MIT',
      note:
        'Offered by its author under "MIT or MPL-2.0", which is not a valid ' +
        'SPDX expression only because of the lowercase "or". This ' +
        'distribution elects MIT, so the MPL-2.0 obligations do not apply ' +
        'to this component.',
    },
  },
};

module.exports = { thirdPartyLicensesConfig };
