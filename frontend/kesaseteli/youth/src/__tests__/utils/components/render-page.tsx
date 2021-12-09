import Footer from 'kesaseteli/youth/components/footer/Footer';
import Header from 'kesaseteli/youth/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({ backendUrl: getBackendDomain(), Header, Footer });

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
