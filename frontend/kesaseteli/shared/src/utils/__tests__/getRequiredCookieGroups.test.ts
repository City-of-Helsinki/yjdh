import {
  ESSENTIAL_COOKIES_DESCRIPTION,
  ESSENTIAL_COOKIES_TITLE,
} from 'kesaseteli-shared/constants/cookie-consent';
import getRequiredCookieGroups from 'kesaseteli-shared/utils/getRequiredCookieGroups';
import {
  type RequiredGroups,
  getDefaultKesaseteliRequiredGroups,
} from 'shared/utils/cookieConsentSettings';

const getEssentialGroup = (
  groups: RequiredGroups
): RequiredGroups[number] | undefined =>
  groups.find((group) => group.groupId === 'essential');

const getEssentialCookies = (
  groups: RequiredGroups
): RequiredGroups[number]['cookies'] => getEssentialGroup(groups)?.cookies ?? [];

const allCookieProps = {
  includeSessionIdCookie: true,
  includeSamlSessionCookie: true,
  includeCsrfTokenCookie: true,
} as const;

describe('getRequiredCookieGroups', () => {
  it('returns only the default groups when no cookies are requested', () => {
    expect(getRequiredCookieGroups()).toEqual(
      getDefaultKesaseteliRequiredGroups()
    );
    expect(
      getRequiredCookieGroups({
        includeSessionIdCookie: false,
        includeSamlSessionCookie: false,
        includeCsrfTokenCookie: false,
      })
    ).toEqual(getDefaultKesaseteliRequiredGroups());
  });

  it('keeps the default groups and appends the essential group', () => {
    const defaultGroups = getDefaultKesaseteliRequiredGroups();
    const groups = getRequiredCookieGroups({ includeCsrfTokenCookie: true });

    expect(groups).toHaveLength(defaultGroups.length + 1);
    expect(groups.slice(0, defaultGroups.length)).toEqual(defaultGroups);
    expect(groups[groups.length - 1]).toMatchObject({
      groupId: 'essential',
      title: ESSENTIAL_COOKIES_TITLE,
      description: ESSENTIAL_COOKIES_DESCRIPTION,
    });
  });

  it.each([
    [{ includeSessionIdCookie: true }, ['sessionid']],
    [{ includeSamlSessionCookie: true }, ['kesaseteli_saml_session']],
    [{ includeCsrfTokenCookie: true }, ['yjdhcsrftoken']],
    [
      allCookieProps,
      ['sessionid', 'kesaseteli_saml_session', 'yjdhcsrftoken'],
    ],
  ])('includes the requested cookies %j in a fixed order', (props, names) => {
    expect(
      getEssentialCookies(getRequiredCookieGroups(props)).map(
        (cookie) => cookie.name
      )
    ).toEqual(names);
  });

  it('uses the same host as the default groups for every cookie', () => {
    const expectedHost = getDefaultKesaseteliRequiredGroups()[0].cookies[0].host;
    const cookies = getEssentialCookies(
      getRequiredCookieGroups(allCookieProps)
    );
    cookies.forEach((cookie) => {
      expect(cookie.host).toBe(expectedHost);
    });
  });
});
