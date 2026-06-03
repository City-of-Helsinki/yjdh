import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { ErrorOption, FormProvider, useForm } from 'react-hook-form';

import ErrorNotificationRow from '../ErrorNotificationRow';

const TestForm: React.FC<{
  children: React.ReactNode;
  defaultErrors?: Record<string, ErrorOption>;
}> = ({ children, defaultErrors }) => {
  const methods = useForm({
    defaultValues: {
      contact_person_name: 'Jane Doe',
    },
  });
  React.useEffect(() => {
    if (defaultErrors) {
      Object.entries(defaultErrors).forEach(([key, error]) => {
        methods.setError(key as 'contact_person_name', error);
      });
    }
  }, [defaultErrors, methods]);

  return (
    <FormProvider {...methods}>
      <form>
        <input {...methods.register('contact_person_name')} />
        {children}
      </form>
    </FormProvider>
  );
};

describe('ErrorNotificationRow', () => {
  it('renders null when no error exists', () => {
    renderComponent(
      <TestForm>
        <ErrorNotificationRow fieldPath="contact_person_name" />
      </TestForm>
    );
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('renders list item with translated error text when error is present', async () => {
    renderComponent(
      <TestForm defaultErrors={{ contact_person_name: { type: 'required' } }}>
        <ErrorNotificationRow fieldPath="contact_person_name" />
      </TestForm>
    );

    const link = await screen.findByRole('link', {
      name: 'Tieto puuttuu tai on virheellinen',
    });
    expect(link).toBeInTheDocument();
    expect(screen.getByText(/Yhteyshenkilön nimi/)).toBeInTheDocument();
  });
});
