import renderPageF from 'shared/__tests__/utils/render-component/render-page';
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';
import Footer from 'tet/youth/components/footer/Footer';
import Header from 'tet/youth/components/header/Header';

const render = renderPageF({
  backendUrl: linkedEventsUrl,
  Footer,
  Header,
});

const renderPage = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderPage;
