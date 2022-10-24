import renderPageF from 'shared/__tests__/utils/render-component/render-page';
import i18n from 'tet/admin/__tests__/utils/init-i18n'
import AuthProvider from 'tet/admin/auth/AuthProvider';
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';
import Footer from 'tet/admin/components/footer/Footer';
import Header from 'tet/admin/components/header/Header';

const render = renderPageF({ backendUrl: getBackendDomain(), i18n, Header, Footer, AuthProvider, confirmDialog: true });

const renderPage = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderPage;
