import Footer from 'tet/admin/components/footer/Footer';
import AuthProvider from 'tet/admin/auth/AuthProvider';
import Header from 'tet/admin/components/header/Header';
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({ backendUrl: getBackendDomain(), Header, Footer, AuthProvider, confirmDialog: true });

const renderPage = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderPage;
