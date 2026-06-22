/* eslint-disable jest/no-export, jest/expect-expect, jest/no-done-callback, security/detect-non-literal-fs-filename */

export const runCookieConsentTests = (
  getFrontendUrl: (path?: string) => string
): void => {
  test('Cookie consent banner is bypassed and settings are pre-applied', async (t) => {
    // This test validates that the clientScript in `.testcaferc.base.js` correctly pre-injects
    // the `helfi-cookie-consents` cookie with checksums derived from `cookieConsentSettings.ts`.
    //
    // The HDS cookie-consent library reads this cookie on page load. If the checksums match the
    // current group definitions (from `getDefaultKesaseteliRequiredGroups()` and
    // `getDefaultKesaseteliOptionalGroups()`), the library accepts the stored consent and skips
    // the modal. The cookie-consent UI is rendered inside a Shadow DOM, so we verify acceptance
    // by inspecting `document.cookie` directly — a reliable, shadow-DOM-independent approach.
    //
    // If this test fails, update the checksums in `.testcaferc.base.js` to match the current
    // output of `getDefaultKesaseteliRequiredGroups()` / `getDefaultKesaseteliOptionalGroups()`
    // in `cookieConsentSettings.ts`.
    await t.navigateTo(getFrontendUrl('/'));

    const cookieValue = await t.eval(() => decodeURIComponent(document.cookie));

    await t
      .expect(cookieValue)
      .contains(
        'helfi-cookie-consents',
        'The `helfi-cookie-consents` cookie was not found. The clientScript in `.testcaferc.base.js` may not have run.'
      );

    await t
      .expect(cookieValue)
      .contains(
        '"shared"',
        'The required cookie group ("shared") is missing from `helfi-cookie-consents`. ' +
          'Update the checksums in `.testcaferc.base.js` to match `cookieConsentSettings.ts`.'
      );

    await t
      .expect(cookieValue)
      .contains(
        '"statistics"',
        'The optional cookie group ("statistics") is missing from `helfi-cookie-consents`. ' +
          'Update the checksums in `.testcaferc.base.js` to match `cookieConsentSettings.ts`.'
      );
  });
};

/* eslint-enable jest/no-export, jest/expect-expect, jest/no-done-callback, security/detect-non-literal-fs-filename */
