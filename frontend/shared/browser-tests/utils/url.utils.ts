import { ClientFunction } from 'testcafe';

import { setDataToPrintOnFailure } from './testcafe.utils';

export const refreshPage = ClientFunction(() => document.location.reload());
export const getCurrentUrl = ClientFunction(() => document.location.href);
export const getCurrentPathname = ClientFunction(
  () => document.location.pathname
);
export const getUrlParam = ClientFunction((param: string) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
});

export const getUrl = (baseUrl = '', path?: string): string =>
  `${baseUrl}${path?.startsWith('/') ? path : path ? `/${path}` : ''}`;

export const SuomiFiAuthorizationUrls = [
  'https://testi.apro.tunnistus.fi/',
  'https://tunnistus.test.hel.ninja',
];

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.FRONTEND_URL, path);

export const goToUrl = async (
  t: TestController,
  baseUrl = '',
  path?: string
): Promise<void> => {
  const url = getUrl(baseUrl, path);
  setDataToPrintOnFailure(t, 'goToUrl', url);
  await t.navigateTo(url);
  /* eslint-disable no-await-in-loop */
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 60; i++) {
    await t.wait(1000);
    await t.navigateTo(getUrl(baseUrl, path));
    const currentUrl = await getCurrentUrl();
    if (currentUrl.startsWith(url)) {
      return;
    }
  }
  /* eslint-enable no-await-in-loop */
};
