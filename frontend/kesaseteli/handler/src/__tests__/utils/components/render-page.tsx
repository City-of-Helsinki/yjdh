import Header from 'kesaseteli/handler/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import expectToGetSummerVoucherConfiguration from 'kesaseteli/handler/__tests__/utils/backend/expectToGetSummerVoucherConfiguration';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({
  backendUrl: getBackendDomain(),
  Header,
  confirmDialog: true,
});

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
