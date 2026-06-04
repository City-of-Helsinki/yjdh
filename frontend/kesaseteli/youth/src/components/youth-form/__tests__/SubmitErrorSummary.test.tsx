import { render, screen } from '@testing-library/react';
import { SubmitError } from 'kesaseteli/youth/hooks/useHandleYouthApplicationSubmit';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import SubmitErrorSummary from '../SubmitErrorSummary';

const renderWithForm = (
  testChildren: React.ReactNode
): ReturnType<typeof render> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm({
      defaultValues: {},
    });
    return (
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>{children}</FormProvider>
      </ThemeProvider>
    );
  };
  return render(testChildren as React.ReactElement, { wrapper: Wrapper });
};

describe('SubmitErrorSummary', () => {
  it('renders recheck error notification', () => {
    const error: SubmitError = {
      type: 'please_recheck_data',
      errorFields: [],
    };
    renderWithForm(<SubmitErrorSummary error={error} />);
    expect(
      screen.getByText(
        'Tarkistathan, että olet kirjoittanut nimesi ja henkilötunnuksesi kuten ne ovat Kela-kortissasi.'
      )
    ).toBeInTheDocument();
  });

  it('renders validation error notification with error fields', () => {
    const error: SubmitError = {
      type: 'validation_error',
      errorFields: ['first_name', 'last_name'],
    };
    renderWithForm(<SubmitErrorSummary error={error} />);
    expect(
      screen.getByText('Tarkista seuraavat kentät: Etunimi, Sukunimi')
    ).toBeInTheDocument();
  });

  it('renders ErrorSummary wrapper with null content when error.type is null', () => {
    const error: SubmitError = {
      type: null,
      errorFields: [],
    };
    renderWithForm(<SubmitErrorSummary error={error} />);
    expect(
      screen.getByText('Hups! Jokin tiedoista ei ole oikein')
    ).toBeInTheDocument();
  });

  it('throws an error for unknown types due to assertUnreachable', () => {
    const error = {
      type: 'unknown_type' as unknown as SubmitError['type'],
      errorFields: [],
    };

    /* eslint-disable no-console */
    // Silence error log of assertUnreachable
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      expect(() => {
        renderWithForm(<SubmitErrorSummary error={error} />);
      }).toThrow('Unknown submit error type: unknown_type');
    } finally {
      console.error = originalConsoleError;
      /* eslint-enable no-console */
    }
  });
});
