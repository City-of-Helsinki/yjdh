import {
  AUTH_SESSION_COOKIE_DESCRIPTION,
  ESSENTIAL_COOKIES_DESCRIPTION,
  ESSENTIAL_COOKIES_TITLE,
  LOCALIZED_364_DAYS,
  LOCALIZED_TWO_HOURS,
  SECURITY_CONTROL_COOKIE_DESCRIPTION,
  StorageType,
} from 'kesaseteli-shared/constants/cookie-consent';
import {
  type RequiredGroups,
  getDefaultKesaseteliRequiredGroups,
} from 'shared/utils/cookieConsentSettings';

type Props = {
  includeSessionIdCookie?: boolean;
  includeSamlSessionCookie?: boolean;
  includeCsrfTokenCookie?: boolean;
};

const getRequiredCookieGroups = ({
  includeSessionIdCookie,
  includeSamlSessionCookie,
  includeCsrfTokenCookie,
}: Props = {}): RequiredGroups => {
  const defaultGroups = getDefaultKesaseteliRequiredGroups();
  const host = defaultGroups[0].cookies[0].host; // eslint-disable-line prefer-destructuring

  const sessionIdCookie = {
    // Must match the actual used value of SESSION_COOKIE_NAME in backend,
    // see https://docs.djangoproject.com/en/5.2/ref/settings/#session-cookie-name
    name: 'sessionid',
    host,
    description: AUTH_SESSION_COOKIE_DESCRIPTION,
    // Must match the actual used value of SESSION_COOKIE_AGE in backend, see
    // https://docs.djangoproject.com/en/5.2/ref/settings/#session-cookie-age
    expiration: LOCALIZED_TWO_HOURS,
    storageType: StorageType.Cookie,
  } as const;

  const samlSessionCookie = {
    // Must match the actual used value of SAML_SESSION_COOKIE_NAME in backend, see
    // https://djangosaml2.readthedocs.io/contents/setup.html
    name: 'kesaseteli_saml_session',
    host,
    description: AUTH_SESSION_COOKIE_DESCRIPTION,
    // Must match the actual used value of SESSION_COOKIE_AGE in backend, see
    // https://docs.djangoproject.com/en/5.2/ref/settings/#session-cookie-age
    expiration: LOCALIZED_TWO_HOURS,
    storageType: StorageType.Cookie,
  } as const;

  const csrfTokenCookie = {
    // Must match the actual used value of CSRF_COOKIE_NAME in backend, see
    // https://docs.djangoproject.com/en/5.2/ref/settings/#csrf-cookie-name
    name: 'yjdhcsrftoken',
    host,
    description: SECURITY_CONTROL_COOKIE_DESCRIPTION,
    // Must match the actual used value of CSRF_COOKIE_AGE in backend, see
    // https://docs.djangoproject.com/en/5.2/ref/settings/#csrf-cookie-age
    expiration: LOCALIZED_364_DAYS,
    storageType: StorageType.Cookie,
  } as const;

  const essentialCookies = [
    ...(includeSessionIdCookie ? [sessionIdCookie] : []),
    ...(includeSamlSessionCookie ? [samlSessionCookie] : []),
    ...(includeCsrfTokenCookie ? [csrfTokenCookie] : []),
  ];

  if (essentialCookies.length === 0) {
    return defaultGroups;
  }

  const essentialCookiesGroup = {
    groupId: 'essential',
    title: ESSENTIAL_COOKIES_TITLE,
    description: ESSENTIAL_COOKIES_DESCRIPTION,
    cookies: essentialCookies,
  };

  return [...defaultGroups, essentialCookiesGroup];
};

export default getRequiredCookieGroups;
