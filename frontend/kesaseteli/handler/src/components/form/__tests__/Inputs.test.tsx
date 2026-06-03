import { act, screen, waitFor } from '@testing-library/react';
import type { ApplicationWithoutSsnFormData } from 'kesaseteli/handler/types/application-without-ssn-types';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';

import DateInput from '../DateInput';
import Field from '../Field';
import SelectionGroup from '../SelectionGroup';
import TextInput from '../TextInput';

const TestForm: React.FC<{
  children: (
    methods: UseFormReturn<ApplicationWithoutSsnFormData>
  ) => React.ReactNode;
}> = ({ children }) => {
  const methods = useForm<ApplicationWithoutSsnFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      nonVtjBirthdate: '',
      language: undefined,
      school: '',
      postcode: '',
      phoneNumber: '',
      email: '',
      additionalInfoDescription: '',
      nonVtjHomeMunicipality: '',
    },
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>{children(methods)}</form>
    </FormProvider>
  );
};

describe('Form Inputs', () => {
  describe('Field', () => {
    it('renders with value', () => {
      renderComponent(
        <Field id="test-field" type="vtjInfo.name" value="John Doe" />
      );
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('renders hyphen if value is missing/falsy', () => {
      renderComponent(<Field id="test-field" type="vtjInfo.name" value="" />);
      expect(screen.getByText(/-/i)).toBeInTheDocument();
    });
  });

  describe('TextInput', () => {
    it('renders and supports helper formats', () => {
      renderComponent(
        <TestForm>
          {() => <TextInput id="firstName" helperFormat="A-Z" />}
        </TestForm>
      );
      expect(screen.getByLabelText(/etunimi/i)).toBeInTheDocument();
    });

    it('displays custom pattern errors with helper format', async () => {
      let formMethods!: UseFormReturn<ApplicationWithoutSsnFormData>;
      renderComponent(
        <TestForm>
          {(methods) => {
            formMethods = methods;
            return <TextInput id="firstName" helperFormat="A-Z" />;
          }}
        </TestForm>
      );

      await act(async () => {
        formMethods.setError('firstName', {
          type: 'pattern',
          message: 'Virheellinen muoto',
        });
      });

      expect(
        screen.getByText(/virheellinen muoto. käytä muotoa: a-z/i)
      ).toBeInTheDocument();
    });
  });

  describe('DateInput', () => {
    it('renders date input base', () => {
      renderComponent(
        <TestForm>
          {() => <DateInput id="nonVtjBirthdate" validation={{}} />}
        </TestForm>
      );
      expect(screen.getByLabelText(/syntymäpäivä/i)).toBeInTheDocument();
    });

    it('sets custom error type messages for pattern/required errors', async () => {
      let formMethods!: UseFormReturn<ApplicationWithoutSsnFormData>;
      renderComponent(
        <TestForm>
          {(methods) => {
            formMethods = methods;
            return (
              <DateInput id="nonVtjBirthdate" validation={{ required: true }} />
            );
          }}
        </TestForm>
      );

      await act(async () => {
        formMethods.setError('nonVtjBirthdate', { type: 'required' });
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            /tieto puuttuu tai on virheellinen. käytä muotoa p.k.vvvv/i
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('SelectionGroup', () => {
    it('renders selection options', () => {
      renderComponent(
        <TestForm>
          {() => <SelectionGroup id="language" values={['en', 'fi', 'sv']} />}
        </TestForm>
      );
      expect(screen.getByLabelText(/englanti/i)).toBeInTheDocument();
    });

    it('displays error text when selection group has an error', async () => {
      let formMethods!: UseFormReturn<ApplicationWithoutSsnFormData>;
      renderComponent(
        <TestForm>
          {(methods) => {
            formMethods = methods;
            return <SelectionGroup id="language" values={['en', 'fi', 'sv']} />;
          }}
        </TestForm>
      );

      await act(async () => {
        formMethods.setError('language', { type: 'required' });
      });

      expect(screen.getByText(/valitse jokin vaihtoehto/i)).toBeInTheDocument();
    });
  });
});
