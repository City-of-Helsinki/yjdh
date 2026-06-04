import { render, screen } from '@testing-library/react';
import useRegisterInput from 'kesaseteli/youth/hooks/useRegisterInput';
import { useCurrentYearSummerVoucherConfig } from 'kesaseteli-shared/hooks/useCurrentYearSummerVoucherConfig';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import theme from 'shared/styles/theme';
import { ThemeProvider } from 'styled-components';

import TargetGroupSelection from '../TargetGroupSelection';

jest.mock('kesaseteli-shared/hooks/useCurrentYearSummerVoucherConfig');
jest.mock('kesaseteli/youth/hooks/useRegisterInput');

const renderWithForm = (
  testChildren: React.ReactNode
): ReturnType<typeof render> => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const methods = useForm({
      defaultValues: {
        target_group: '',
      },
    });
    return (
      <ThemeProvider theme={theme}>
        <FormProvider {...methods}>{children}</FormProvider>
      </ThemeProvider>
    );
  };
  return render(testChildren as React.ReactElement, { wrapper: Wrapper });
};

describe('TargetGroupSelection', () => {
  beforeEach(() => {
    (useRegisterInput as jest.Mock).mockReturnValue(() => ({
      id: 'target_group',
      label: 'Target Group',
      registerOptions: { required: true },
    }));
  });

  it('renders loading text when config is loading', () => {
    (useCurrentYearSummerVoucherConfig as jest.Mock).mockReturnValue({
      query: { isLoading: true, isError: false },
      currentConfiguration: undefined,
    });

    renderWithForm(<TargetGroupSelection />);
    expect(
      screen.getByText('Ladataan kohtaa luokka / koulutusaste...')
    ).toBeInTheDocument();
  });

  it('renders error message when config fails', () => {
    (useCurrentYearSummerVoucherConfig as jest.Mock).mockReturnValue({
      query: { isLoading: false, isError: true },
      currentConfiguration: undefined,
    });

    renderWithForm(<TargetGroupSelection />);
    expect(
      screen.getByText(
        'Luokkaa / koulutusastetta ei pystytty lataamaan. Hakemuksen täyttäminen ei ole tällä hetkellä mahdollista.'
      )
    ).toBeInTheDocument();
  });

  it('renders select group when target groups are loaded successfully', () => {
    (useCurrentYearSummerVoucherConfig as jest.Mock).mockReturnValue({
      query: { isLoading: false, isError: false },
      currentConfiguration: {
        target_groups: [
          { id: 'target_group_1', name: 'Target Group 1' },
          { id: 'target_group_2', name: 'Target Group 2' },
        ],
      },
    });

    renderWithForm(<TargetGroupSelection />);
    expect(
      screen.getByRole('group', { name: /Target Group/ })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Target Group 1')).toBeInTheDocument();
  });
});
