import i18n from 'benefit/handler/__tests__/utils/i18n/i18n-test';
import { getBackendDomain } from 'benefit-shared/backend-api/backend-api';
import renderComponentF from 'shared/__tests__/utils/render-component/render-component';

const render = renderComponentF(i18n, getBackendDomain());

const renderComponent = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => render(...params);

export default renderComponent;
