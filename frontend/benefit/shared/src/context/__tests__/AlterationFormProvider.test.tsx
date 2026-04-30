import { AxiosError } from 'axios';
import renderComponent from 'benefit-shared/__tests__/utils/render-component';
import AlterationFormContext from 'benefit-shared/context/AlterationFormContext';
import AlterationFormProvider from 'benefit-shared/context/AlterationFormProvider';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import { FormikProps } from 'formik';
import React from 'react';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

describe('AlterationFormProvider', () => {
  const renderSubject = ({
    children = <div>Provider child</div>,
    ...props
  }: Partial<React.ComponentProps<typeof AlterationFormProvider>> = {}): ReturnType<
    typeof renderComponent
  > =>
    renderComponent(
      <AlterationFormProvider
        t={null}
        formik={null}
        language="fi"
        isSubmitted={false}
        isSubmitting={false}
        handleSubmit={null}
        error={null}
        {...props}
      >
        {children}
      </AlterationFormProvider>
    );

  it('renders children', () => {
    renderSubject();

    expect(screen.getByText('Provider child')).toBeInTheDocument();
  });

  it('provides passed values through context', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();

    const Consumer = (): JSX.Element => {
      const {
        language,
        isSubmitted,
        isSubmitting,
        formik,
        error,
        handleSubmit: submit,
      } = React.useContext(AlterationFormContext);

      return (
        <div>
          <span>{language}</span>
          <span>{`submitted:${isSubmitted},submitting:${isSubmitting}`}</span>
          <span>{`formik:${Boolean(formik)},error:${Boolean(error)}`}</span>
          <button type="button" onClick={(event) => submit?.(event)}>
            Submit with context handler
          </button>
        </div>
      );
    };

    renderSubject({
      formik: {} as FormikProps<Partial<ApplicationAlteration>>,
      language: 'sv',
      isSubmitted: true,
      isSubmitting: true,
      handleSubmit,
      error: {} as AxiosError,
      children: <Consumer />,
    });

    expect(screen.getByText('sv')).toBeInTheDocument();
    expect(
      screen.getByText('submitted:true,submitting:true')
    ).toBeInTheDocument();
    expect(screen.getByText('formik:true,error:true')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Submit with context handler' })
    );

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});