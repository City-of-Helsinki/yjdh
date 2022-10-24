import renderPageF from 'shared/__tests__/utils/render-component/render-page';
import i18n from 'tet/youth/__tests__/utils/init-i18n'
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';
import Footer from 'tet/youth/components/footer/Footer';
import Header from 'tet/youth/components/header/Header';

const render = renderPageF({
  backendUrl: linkedEventsUrl,
  i18n,
  Footer,
  Header,
});

const renderPage = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderPage;
