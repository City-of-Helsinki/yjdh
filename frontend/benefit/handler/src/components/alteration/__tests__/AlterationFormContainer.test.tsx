import { act, RenderResult, screen } from '@testing-library/react';
import { createAlterationApplication } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import AlterationFormContainer from 'benefit/handler/components/alteration/AlterationFormContainer';
import useAlterationForm from 'benefit/handler/components/alteration/useAlterationForm';
import {
  ALTERATION_TYPE,
  APPLICATION_STATUSES,
} from 'benefit-shared/constants';
import { ApplicationAlterationData } from 'benefit-shared/types/application';
import React from 'react';
import { useQueryClient } from 'react-query';
import hdsToast from 'shared/components/toast/Toast';

jest.mock('benefit/handler/components/alteration/useAlterationForm');
jest.mock(
  'benefit-shared/components/alterationForm/AlterationForm',
  () =>
    function MockAlterationForm(): JSX.Element {
      return <div data-testid="alteration-form" />;
    }
);
jest.mock('shared/components/toast/Toast', () => jest.fn());
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(),
}));

const handleSubmit = jest.fn();
const onCancel = jest.fn();
const onSuccess = jest.fn();
const invalidateQueries = jest.fn();

const mockUseAlterationForm = useAlterationForm as jest.MockedFunction<
  typeof useAlterationForm
>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<
  typeof useQueryClient
>;
const mockHdsToast = hdsToast as jest.MockedFunction<typeof hdsToast>;

const labels = {
  submit: 'Tallenna',
  cancel: 'Peruuta',
};

const application = createAlterationApplication({
  status: APPLICATION_STATUSES.ACCEPTED,
});

type UseAlterationFormArgs = Parameters<typeof useAlterationForm>[0];

const baseHookState = {
  handleSubmit,
  isSubmitted: false,
  isSubmitting: false,
  formik: { isValid: true },
  t: jest.fn(),
  language: 'fi',
  error: null,
};

const renderSubject = (): RenderResult =>
  renderComponent(
    <AlterationFormContainer
      application={application}
      onCancel={onCancel}
      onSuccess={onSuccess}
    />
  ).renderResult;

const getHookArgs = (): UseAlterationFormArgs =>
  mockUseAlterationForm.mock.calls.at(-1)?.[0] as UseAlterationFormArgs;

const getSubmitButton = (): HTMLElement =>
  screen.getByRole('button', { name: labels.submit });

const getCancelButton = (): HTMLElement =>
  screen.getByRole('button', { name: labels.cancel });

describe('AlterationFormContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line unicorn/no-useless-undefined -- explicit value required by Jest typing
    invalidateQueries.mockResolvedValue(undefined);
    mockUseQueryClient.mockReturnValue({
      invalidateQueries,
    } as never);
    mockUseAlterationForm.mockReturnValue(baseHookState as never);
  });

  it('renders the form container content and actions', () => {
    renderSubject();

    expect(
      screen.getByRole('heading', { name: 'Ilmoita muutoksesta työsuhteessa' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('alteration-form')).toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();
    expect(getCancelButton()).toBeEnabled();
  });

  it('calls handleSubmit and onCancel from the action buttons', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getSubmitButton());
    await user.click(getCancelButton());

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows validation error and disables submit when the submitted form is invalid', () => {
    mockUseAlterationForm.mockReturnValue({
      ...baseHookState,
      isSubmitted: true,
      formik: { isValid: false },
    } as never);

    renderSubject();

    expect(getSubmitButton()).toBeDisabled();
    expect(
      screen.getByText('Täytä lomakkeen puuttuvat tai virheelliset kentät')
    ).toBeInTheDocument();
  });

  it('disables submit while submitting', () => {
    mockUseAlterationForm.mockReturnValue({
      ...baseHookState,
      isSubmitting: true,
    } as never);

    renderSubject();

    expect(
      screen.getByRole('button', { name: 'Lähetetään...' })
    ).toBeDisabled();
  });

  it('invalidates queries, calls onSuccess, and shows a suspension success toast', async () => {
    renderSubject();

    const hookArgs = getHookArgs();

    await act(async () => {
      await hookArgs.onSuccess?.({
        application: 'app-id',
        alteration_type: ALTERATION_TYPE.SUSPENSION,
        end_date: '2024-06-30',
        resume_date: '2024-07-15',
      } as ApplicationAlterationData);
    });

    expect(invalidateQueries).toHaveBeenCalledWith(['applications', 'app-id']);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'success',
        labelText: 'Uusi työsuhteen muutos ilmoitettu',
        text: 'Työsuhde on keskeytynyt 30.6.2024–15.7.2024. Käsittele tehty muutosilmoitus.',
      })
    );
  });

  it('shows a termination success toast when the created alteration is a termination', async () => {
    renderSubject();

    const hookArgs = getHookArgs();

    await act(async () => {
      await hookArgs.onSuccess?.({
        application: 'app-id',
        alteration_type: ALTERATION_TYPE.TERMINATION,
        end_date: '2024-06-30',
        resume_date: undefined,
      } as ApplicationAlterationData);
    });

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Työsuhde on päättynyt 30.6.2024. Käsittele tehty muutosilmoitus.',
      })
    );
  });

  it('shows field-specific error links in an error toast', async () => {
    renderSubject();

    const hookArgs = getHookArgs();

    act(() => {
      hookArgs.onError?.({
        response: {
          data: {
            contact_person_name: ['Pakollinen tieto'],
            unknown_field: 'Tuntematon virhe',
          },
        },
      } as never);
    });

    expect(mockHdsToast).toHaveBeenCalledWith(
      expect.objectContaining({
        autoDismissTime: 0,
        type: 'error',
        labelText: 'Odottamaton virhe',
        text: expect.any(Array),
      })
    );

    const toastText = mockHdsToast.mock.calls.at(-1)?.[0].text;
    const { getByRole, getByText } = renderComponent(
      <ul>{toastText}</ul>
    ).renderResult;

    expect(
      getByRole('link', {
        name: 'Yhteyshenkilö laskutusasioissa: Pakollinen tieto',
      })
    ).toHaveAttribute('href', '#alteration-contact-person-name');
    expect(getByText('Tuntematon virhe')).toBeInTheDocument();
  });
});
