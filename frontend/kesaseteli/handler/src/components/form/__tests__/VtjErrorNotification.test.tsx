import { screen } from '@testing-library/react';
import getHandlerTranslationsApi from 'kesaseteli/handler/__tests__/utils/i18n/get-handler-translations-api';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import VtjErrorNotification from '../VtjErrorNotification';

describe('VtjErrorNotification', () => {
  const {
    translations: { fi: translations },
    regexp,
  } = getHandlerTranslationsApi();

  it('renders with default type and size', () => {
    renderComponent(<VtjErrorNotification reason="notFound" />);
    expect(
      screen.getByText(
        regexp(translations.handlerApplication.vtjException.notFound)
      )
    ).toBeInTheDocument();
  });

  it('renders with explicit large size as set in VtjInfo for notFound', () => {
    renderComponent(<VtjErrorNotification reason="notFound" size="large" />);
    expect(
      screen.getByText(
        regexp(translations.handlerApplication.vtjException.notFound)
      )
    ).toBeInTheDocument();
  });

  it('renders with error type for missing SSN', () => {
    renderComponent(<VtjErrorNotification reason="missingSsn" type="error" />);
    expect(
      screen.getByText(
        regexp(translations.handlerApplication.vtjException.missingSsn)
      )
    ).toBeInTheDocument();
  });
});
