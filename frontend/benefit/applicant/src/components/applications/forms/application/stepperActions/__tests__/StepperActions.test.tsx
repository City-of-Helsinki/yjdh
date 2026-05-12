import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import StepperActions from '../StepperActions';

type StepperActionsProps = React.ComponentProps<typeof StepperActions>;

const backButtonText = 'Takaisin';
const saveButtonText = 'Tallenna ja sulje';
const continueButtonText = 'Jatka';
const sendButtonText = 'Lähetä';
const saveErrorText = 'Täytä lomakkeen puuttuvat tai virheelliset kentät';
const draftDeleteActionText = 'Poista hakemus';
const cancelActionText = 'Peruuta hakemus';
const draftDeleteTitle = 'Haluatko varmasti poistaa luonnoksen?';
const draftDeleteBody =
  'Hakemus poistetaan lopullisesti eikä sitä voida enää palauttaa.';
const cancelTitle = 'Haluatko varmasti peruuttaa hakemuksen?';
const cancelBody = 'Hakemus peruutetaan, eikä sitä voida enää palauttaa.';

const defaultProps: StepperActionsProps = {
  applicationStatus: APPLICATION_STATUSES.DRAFT,
  handleSubmit: jest.fn(),
  handleBack: jest.fn(),
  handleSave: jest.fn(),
};

const renderStepperActions = (
  props: Partial<StepperActionsProps> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<StepperActions {...defaultProps} {...props} />);

const getBackButton = (): HTMLElement =>
  screen.getByRole('button', { name: backButtonText });

const getSaveButton = (): HTMLElement =>
  screen.getByRole('button', { name: saveButtonText });

const getNextButton = (): HTMLElement => screen.getByTestId('nextButton');

const getDeleteButton = (): HTMLElement => screen.getByTestId('deleteButton');

const getModalSubmitButton = (): HTMLElement =>
  screen.getByTestId('modalSubmit');

const openDeleteModal = async (
  user: ReturnType<typeof setupUserAndRender>
): Promise<void> => {
  await user.click(getDeleteButton());
};

describe('StepperActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders back, save and continue actions when handlers are provided', () => {
    renderStepperActions();

    expect(getBackButton()).toBeInTheDocument();
    expect(getSaveButton()).toBeEnabled();
    expect(getNextButton()).toHaveTextContent(continueButtonText);
  });

  it('calls back, save and submit handlers on click', async () => {
    const handleBack = jest.fn();
    const handleSave = jest.fn();
    const handleSubmit = jest.fn();
    const user = setupUserAndRender(() => {
      renderStepperActions({ handleBack, handleSave, handleSubmit });
    });

    await user.click(getBackButton());
    await user.click(getSaveButton());
    await user.click(getNextButton());

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('shows save error message and disables save button when save handler is missing', () => {
    renderStepperActions({ handleSave: undefined });

    expect(getSaveButton()).toBeDisabled();
    expect(screen.getByText(saveErrorText)).toBeInTheDocument();
  });

  it('shows send label on next button on last step and respects disabledNext', () => {
    renderStepperActions({ lastStep: true, disabledNext: true });

    expect(getNextButton()).toHaveTextContent(sendButtonText);
    expect(getNextButton()).toBeDisabled();
  });

  it('does not render delete action when delete handler is missing', () => {
    renderStepperActions({ handleDelete: undefined });

    expect(screen.queryByTestId('deleteButton')).not.toBeInTheDocument();
  });

  it('opens draft delete modal and confirms deletion', async () => {
    const handleDelete = jest.fn();
    const user = setupUserAndRender(() => {
      renderStepperActions({
        applicationStatus: APPLICATION_STATUSES.DRAFT,
        handleDelete,
      });
    });

    expect(getDeleteButton()).toHaveTextContent(draftDeleteActionText);
    await openDeleteModal(user);

    expect(screen.getByText(draftDeleteTitle)).toBeInTheDocument();
    expect(screen.getByText(draftDeleteBody)).toBeInTheDocument();

    await user.click(getModalSubmitButton());

    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('uses cancel application copy for non-draft statuses', async () => {
    const user = setupUserAndRender(() => {
      renderStepperActions({
        applicationStatus: APPLICATION_STATUSES.RECEIVED,
        handleDelete: jest.fn(),
      });
    });

    expect(getDeleteButton()).toHaveTextContent(cancelActionText);

    await openDeleteModal(user);

    expect(screen.getByText(cancelTitle)).toBeInTheDocument();
    expect(screen.getByText(cancelBody)).toBeInTheDocument();
  });
});
