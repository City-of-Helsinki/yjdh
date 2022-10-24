import renderComponentF from 'shared/__tests__/utils/render-component/render-component';
import i18n from 'tet/admin/__tests__/utils/init-i18n'
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';

const render = renderComponentF(i18n, getBackendDomain());

const renderComponent = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderComponent;
