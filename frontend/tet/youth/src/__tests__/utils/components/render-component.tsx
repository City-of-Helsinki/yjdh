import renderComponentF from 'shared/__tests__/utils/render-component/render-component';
import i18n from 'tet/youth/__tests__/utils/init-i18n'
import { linkedEventsUrl } from 'tet/youth/backend-api/backend-api';

const render = renderComponentF(i18n,linkedEventsUrl);

const renderComponent = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderComponent;
