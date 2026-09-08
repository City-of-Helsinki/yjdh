import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import renderPageF from 'kesaseteli-shared/__tests__/utils/render-component/render-page';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';

const render = renderPageF({
  backendUrl: getBackendDomain(),
  AuthProvider,
  Footer,
  Header,
});

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
