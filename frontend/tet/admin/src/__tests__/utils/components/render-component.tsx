import renderComponentF from 'shared/__tests__/utils/render-component/render-component';
import { getBackendDomain } from 'tet/admin/backend-api/backend-api';

const render = renderComponentF(getBackendDomain());

const renderComponent = (...params: Parameters<typeof render>): ReturnType<typeof render> => render(...params);

export default renderComponent;
