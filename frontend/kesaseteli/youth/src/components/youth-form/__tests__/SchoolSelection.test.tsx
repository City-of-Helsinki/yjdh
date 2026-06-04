import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SchoolSelection from 'kesaseteli/youth/components/youth-form/SchoolSelection';
import useSchoolListQuery from 'kesaseteli/youth/hooks/backend/useSchoolListQuery';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

jest.mock('kesaseteli/youth/hooks/backend/useSchoolListQuery');

type YouthFormDataForTest = {
  selectedSchool: { name: string } | null;
  is_unlisted_school: boolean;
  unlistedSchool: string;
};

const renderSchoolSelection = (): ReturnType<typeof render> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm<YouthFormDataForTest>({
      defaultValues: {
        selectedSchool: null,
        is_unlisted_school: false,
        unlistedSchool: '',
      },
      mode: 'onSubmit',
    });

    return (
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            {children}
            <button type="submit">submit</button>
          </form>
        </FormProvider>
      </ThemeProvider>
    );
  };

  return render(<SchoolSelection />, { wrapper: Wrapper });
};

const getSchoolSelector = (): HTMLElement => {
  const byCombobox = screen.queryByRole('combobox', {
    name: /koulu/i,
  });

  if (byCombobox) {
    return byCombobox;
  }

  const byButton = screen.queryByRole('button', { name: /koulu/i });

  if (byButton) {
    return byButton;
  }

  throw new Error('Could not find school selector element');
};

describe('SchoolSelection', () => {
  beforeEach(() => {
    (useSchoolListQuery as jest.Mock).mockReturnValue({
      isSuccess: true,
      data: ['Helsinki school'],
    });
  });

  it('clears selected school error and shows unlisted school input when unlisted school is enabled', async () => {
    const user = userEvent.setup();
    renderSchoolSelection();

    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(
      await screen.findByTestId('selectedSchool-error')
    ).toBeInTheDocument();

    await user.click(screen.getByTestId('is_unlisted_school'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('selectedSchool-error')
      ).not.toBeInTheDocument();
    });
    expect(getSchoolSelector()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('unlistedSchool')).toBeInTheDocument();
  });
});
