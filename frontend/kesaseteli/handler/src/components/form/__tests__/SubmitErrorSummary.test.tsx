import { screen } from '@testing-library/react';
import type { SubmitError } from 'kesaseteli/handler/hooks/application/useHandleApplicationWithoutSsnSubmit';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import SubmitErrorSummary from '../SubmitErrorSummary';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm({
    defaultValues: {},
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('SubmitErrorSummary', () => {
  it('renders validation errors when error type is validation_error', () => {
    const error: SubmitError = {
      type: 'validation_error',
      errorFields: ['first_name', 'email'],
    };

    renderComponent(
      <Wrapper>
        <SubmitErrorSummary error={error} />
      </Wrapper>
    );

    expect(
      screen.getByText(/hups! jokin tiedoista ei ole oikein/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/etunimi, sähköpostiosoite/i)).toBeInTheDocument();
  });

  it('renders the error label when error type is null', () => {
    const error = {
      type: null,
      errorFields: [],
    };

    renderComponent(
      <Wrapper>
        <SubmitErrorSummary error={error} />
      </Wrapper>
    );

    expect(
      screen.getByText(/hups! jokin tiedoista ei ole oikein/i)
    ).toBeInTheDocument();
  });
});
