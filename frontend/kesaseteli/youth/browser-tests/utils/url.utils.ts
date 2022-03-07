import { getUrl } from '@frontend/shared/browser-tests/utils/url.utils';
import TestController, { ClientFunction } from 'testcafe';

const goBack = ClientFunction(() => window.history.back());

export const getFrontendUrl = (path = ''): string =>
  getUrl(process.env.YOUTH_URL ?? 'https://localhost:3100', path);

export const goToHandlerUrl = async (
  t: TestController,
  path = ''
): Promise<void> => {
  await t.navigateTo(
    getUrl(process.env.HANDLER_URL ?? 'https://localhost:3200', path)
  );
};

export const goToBackendUrl = async (
  t: TestController,
  path = ''
): Promise<void> => {
  await t.navigateTo(
    getUrl(
      process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://localhost:8000',
      path
    )
  );
};

export const goToFrontPage = async (t: TestController): Promise<void> => {
  await t.navigateTo(getFrontendUrl());
};

export const clickBrowserBackButton = async (): Promise<void> => {
  await goBack();
};
