import fs from 'node:fs';
import path from 'node:path';

// The config lives in the frontend workspace root, which is not a package, so
// this test is hosted here to run with the shared package's tests.
// eslint-disable-next-line import/no-relative-packages
import { thirdPartyLicensesConfig } from '../../../scripts/thirdPartyLicenses.config';

// eslint-disable-next-line unicorn/prefer-module
const frontendDir = path.join(__dirname, '../../..');

describe('thirdPartyLicensesConfig', () => {
  it('elects Apache-2.0 for the dual-licensed dompurify', () => {
    expect(thirdPartyLicensesConfig.licenseDecisions?.dompurify?.license).toBe(
      'Apache-2.0'
    );
  });

  it('elects MIT for ibantools while it declares "MIT or MPL-2.0"', () => {
    expect(thirdPartyLicensesConfig.licenseDecisions?.ibantools).toMatchObject({
      declared: 'MIT or MPL-2.0',
      license: 'MIT',
    });
  });

  it('keeps frontend/LICENSE identical to the repository LICENSE', () => {
    // The Docker build context is `frontend`, so the notices read the
    // application's license from a copy of the repository root LICENSE.
    const copy = fs.readFileSync(path.join(frontendDir, 'LICENSE'), 'utf8');
    const original = fs.readFileSync(
      path.join(frontendDir, '..', 'LICENSE'),
      'utf8'
    );
    expect(copy).toBe(original);
  });
});
