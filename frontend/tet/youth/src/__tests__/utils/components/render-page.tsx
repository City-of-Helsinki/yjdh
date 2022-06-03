import Footer from 'tet/youth/components/footer/Footer';
import Header from 'tet/youth/components/header/Header';
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';
import renderPageF from 'shared/__tests__/utils/render-component/render-page';

const render = renderPageF({
  backendUrl: linkedEventsUrl,
  Footer,
  Header,
});

const renderPage = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderPage;
