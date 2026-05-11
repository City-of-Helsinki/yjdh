import { RenderResult, screen, waitFor } from '@testing-library/react';
import {
  createAlteration,
  createAlterationApplication,
} from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationHandlingForm from 'benefit/handler/components/alterationHandling/AlterationHandlingForm';
import useAlterationHandlingForm from 'benefit/handler/components/alterationHandling/useAlterationHandlingForm';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import useUpdateApplicationAlterationWithCsvQuery from 'benefit/handler/hooks/useUpdateApplicationAlterationWithCsvQuery';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import i18n from 'i18next';
import React from 'react';

jest.mock(
  'benefit/handler/components/alterationHandling/useAlterationHandlingForm'
);
jest.mock(
  'benefit/handler/hooks/useUpdateApplicationAlterationWithCsvQuery',
  () => jest.fn()
);
jest.mock('shared/utils/file.utils', () => ({
  downloadFile: jest.fn(),
}));
jest.mock(
  'benefit/handler/hooks/applicationHandling/useRouterNavigation',
  () => ({
    useRouterNavigation: jest.fn(),
  })
);
jest.mock(
  'benefit/handler/components/alterationHandling/AlterationCalculator',
  () =>
    function MockAlterationCalculator({
      onCalculationChange,
    }: {
      onCalculationChange: (isOutOfDate: boolean) => void;
    }): JSX.Element {
      return (
        <div>
          <button type="button" onClick={() => onCalculationChange(true)}>
            calc-outdated
          </button>
          <button type="button" onClick={() => onCalculationChange(false)}>
            calc-fresh
          </button>
        </div>
      );
    }
);
jest.mock(
  'benefit/handler/components/alterationHandling/AlterationHandlingConfirmationModal',
  () =>
    function MockAlterationHandlingConfirmationModal({
      isOpen,
      onClose,
      onSubmit,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onSubmit: () => void;
    }): JSX.Element | null {
      if (!isOpen) return null;
      return (
        <div data-testid="confirmation-modal">
          <button type="button" onClick={onSubmit}>
            Vahvista
          </button>
          <button type="button" onClick={onClose}>
            Peruuta
          </button>
        </div>
      );
    }
);
jest.mock(
  'benefit/handler/components/sidebar/Sidebar',
  () =>
    function MockSidebar({
      isOpen,
      onClose,
    }: {
      isOpen: boolean;
      onClose: () => void;
    }): JSX.Element {
      return (
        <div data-testid="sidebar" data-open={String(isOpen)}>
          <button type="button" onClick={onClose}>
            close-sidebar
          </button>
        </div>
      );
    }
);

const mockHandleAlteration = jest.fn();
const mockValidateForm = jest.fn();
const mockNavigateBack = jest.fn();
const onError = jest.fn();
const onSuccess = jest.fn();

const mockUseAlterationHandlingForm =
  useAlterationHandlingForm as jest.MockedFunction<
    typeof useAlterationHandlingForm
  >;
const mockUseUpdateApplicationAlterationWithCsvQuery =
  useUpdateApplicationAlterationWithCsvQuery as jest.MockedFunction<
    typeof useUpdateApplicationAlterationWithCsvQuery
  >;
const mockUseRouterNavigation = useRouterNavigation as jest.MockedFunction<
  typeof useRouterNavigation
>;

const application: Application = createAlterationApplication();

const alteration: ApplicationAlteration = createAlteration();

const t = (key: string, options?: Record<string, unknown>): string =>
  String(i18n.t(key, options as never));

const baseFormik = {
  values: {
    isRecoverable: false,
    recoveryAmount: '0',
    recoveryJustification: '',
    recoveryStartDate: '1.1.2024',
    recoveryEndDate: '31.1.2024',
  },
  errors: {},
  touched: {},
  isValid: true,
  setFieldValue: jest.fn(),
  handleBlur: jest.fn(),
};

const renderSubject = (): RenderResult =>
  renderComponent(
    <AlterationHandlingForm
      application={application}
      alteration={alteration}
      onError={onError}
      onSuccess={onSuccess}
    />
  ).renderResult;

const mockHookReturn = (overrides: Record<string, unknown> = {}): void => {
  mockUseAlterationHandlingForm.mockReturnValue({
    t,
    formik: baseFormik,
    isSubmitted: false,
    isSubmitting: false,
    handleAlteration: mockHandleAlteration,
    validateForm: mockValidateForm,
    ...overrides,
  } as never);
};

const getHandleButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Merkitse käsitellyksi' });
const queryConfirmButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Vahvista' });
const getConfirmButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Vahvista' });
const getCancelButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Peruuta' });
const getCsvButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Lataa maksatustiedot (csv)' });
const getRecoverableYesRadio = (): HTMLElement =>
  screen.getByRole('radio', { name: 'Ylimääräinen tuki laskutetaan takaisin' });
const getRecoverableNoRadio = (): HTMLElement =>
  screen.getByRole('radio', { name: 'Ylimääräistä tukea ei laskuteta' });
const getJustificationTextarea = (): HTMLElement =>
  screen.getByRole('textbox', { name: /Perustelu/ });
const getSidebar = (): HTMLElement => screen.getByTestId('sidebar');
const getHandlingPanelButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Käsittelypaneeli' });
const getBackButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Palaa muutosilmoituksiin' });
const getCloseSidebarButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'close-sidebar' });

describe('AlterationHandlingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateForm.mockResolvedValue(true);
    mockUseUpdateApplicationAlterationWithCsvQuery.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(new Blob(['csv'])),
      isLoading: false,
    } as never);
    mockUseRouterNavigation.mockReturnValue({
      navigateBack: mockNavigateBack,
    } as never);
    mockHookReturn();
  });

  it('opens confirmation modal when handle action validates successfully', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getHandleButton());

    expect(mockValidateForm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(getConfirmButton()).toBeVisible());
  });

  it('does not open confirmation modal when validation fails', async () => {
    const user = setupUserAndRender(() => {
      mockValidateForm.mockResolvedValue(false);
      renderSubject();
    });

    await user.click(getHandleButton());

    expect(queryConfirmButton()).toBeNull();
  });

  it('closes confirmation modal when close callback is triggered', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getHandleButton());
    await waitFor(() => expect(getCancelButton()).toBeVisible());

    await user.click(getCancelButton());

    expect(queryConfirmButton()).toBeNull();
  });

  it('requires CSV download before enabling handle action for recoverable flow', async () => {
    const user = setupUserAndRender(() => {
      mockHookReturn({
        formik: {
          ...baseFormik,
          values: {
            ...baseFormik.values,
            isRecoverable: true,
            recoveryAmount: '123,45',
          },
          touched: { recoveryAmount: true },
        },
      });

      renderSubject();
    });

    const handleButton = getHandleButton();
    expect(handleButton).toBeDisabled();

    await user.click(getCsvButton());

    await waitFor(() => {
      expect(handleButton).toBeEnabled();
    });
  });

  it('sets isRecoverable true when recoverable yes radio is selected', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getRecoverableYesRadio());

    expect(baseFormik.setFieldValue).toHaveBeenCalledWith(
      'isRecoverable',
      true
    );
  });

  it('sets isRecoverable false when recoverable no radio is selected', async () => {
    const user = setupUserAndRender(() => {
      mockHookReturn({
        formik: {
          ...baseFormik,
          values: { ...baseFormik.values, isRecoverable: true },
        },
      });

      renderSubject();
    });

    await user.click(getRecoverableNoRadio());

    expect(baseFormik.setFieldValue).toHaveBeenCalledWith(
      'isRecoverable',
      false
    );
  });

  it('updates recovery justification when textarea value changes', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.type(getJustificationTextarea(), 'Perustelu testiin');

    expect(baseFormik.setFieldValue).toHaveBeenCalledWith(
      'recoveryJustification',
      expect.any(String)
    );
  });

  it('shows calculation out-of-date error when submitted and calculation is outdated', () => {
    mockHookReturn({ isSubmitted: true });

    renderSubject();

    expect(
      screen.getByText('Laskelma ei ole ajan tasalla')
    ).toBeInTheDocument();
  });

  it('shows dirty/invalid form error when submitted and calculation is fresh but form has errors', async () => {
    const user = setupUserAndRender(() => {
      mockHookReturn({
        formik: {
          ...baseFormik,
          errors: { recoveryJustification: 'required' },
        },
        isSubmitted: true,
      });

      renderSubject();
    });

    await user.click(screen.getByRole('button', { name: 'calc-fresh' }));

    expect(
      screen.getByText('Täytä lomakkeen puuttuvat tai virheelliset kentät')
    ).toBeInTheDocument();
  });

  it('navigates back and toggles sidebar visibility from sticky actions', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getBackButton());
    expect(mockNavigateBack).toHaveBeenCalledTimes(1);

    expect(getSidebar()).toHaveAttribute('data-open', 'false');

    await user.click(getHandlingPanelButton());

    expect(getSidebar()).toHaveAttribute('data-open', 'true');
  });

  it('closes sidebar when sidebar onClose callback is triggered', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getHandlingPanelButton());
    expect(getSidebar()).toHaveAttribute('data-open', 'true');

    await user.click(getCloseSidebarButton());

    expect(getSidebar()).toHaveAttribute('data-open', 'false');
  });
});
