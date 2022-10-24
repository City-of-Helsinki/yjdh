import i18n from 'kesaseteli/handler/__tests__/utils/i18n/i18n-test'
import Header from 'kesaseteli/handler/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({
  backendUrl: getBackendDomain(),
  i18n,
  Header,
  confirmDialog: true,
});

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
