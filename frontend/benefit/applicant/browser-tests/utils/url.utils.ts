import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import { ClientFunction } from 'testcafe';

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.APPLICANT_URL ?? 'https://localhost:3000', path);

const goBack = ClientFunction(() => window.history.back());

export const clickBrowserBackButton = async (): Promise<void> => {
  await goBack();
};
