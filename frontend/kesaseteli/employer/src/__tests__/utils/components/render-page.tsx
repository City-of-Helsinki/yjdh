import i18n from 'kesaseteli/employer/__tests__/utils/i18n/i18n-test'
import AuthProvider from 'kesaseteli/employer/auth/AuthProvider';
import Footer from 'kesaseteli/employer/components/footer/Footer';
import Header from 'kesaseteli/employer/components/header/Header';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({
  backendUrl: getBackendDomain(),
  i18n,
  AuthProvider,
  Footer,
  Header,
});

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderPage;
