import i18n from 'kesaseteli/youth/__tests__/utils/i18n/i18n-test'
import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({ backendUrl: getBackendDomain(), i18n, Header, Footer });

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
