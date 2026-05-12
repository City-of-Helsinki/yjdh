import { getBackendDomain } from 'benefit-shared/backend-api/backend-api';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import renderComponentF from 'shared/__tests__/utils/render-component/render-component';

import i18n from '../../../test/i18n/i18n-test';

const render = renderComponentF(getBackendDomain());

const renderComponent = (
  element: Parameters<typeof render>[0],
  ...rest: Parameters<typeof render> extends [unknown, ...infer R] ? R : never[]
): ReturnType<typeof render> =>
  render(<I18nextProvider i18n={i18n}>{element}</I18nextProvider>, ...rest);

export default renderComponent;
