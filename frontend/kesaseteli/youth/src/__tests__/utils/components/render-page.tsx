import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import renderPageF from 'kesaseteli-shared/__tests__/utils/render-component/render-page';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';

const render = renderPageF({ backendUrl: getBackendDomain(), Header, Footer });

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
