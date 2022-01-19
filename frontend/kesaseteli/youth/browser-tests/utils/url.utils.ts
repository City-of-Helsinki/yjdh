import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import { ClientFunction } from 'testcafe';

const goBack = ClientFunction(() => window.history.back());

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.YOUTH_URL ?? 'https://localhost:3100', path);

export const clickBrowserBackButton = async (): Promise<void> => {
  await goBack();
};
