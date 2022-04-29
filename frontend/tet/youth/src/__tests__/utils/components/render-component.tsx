import renderComponentF from 'shared/__tests__/utils/render-component/render-component';
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';

const render = renderComponentF(linkedEventsUrl);

const renderComponent = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderComponent;
