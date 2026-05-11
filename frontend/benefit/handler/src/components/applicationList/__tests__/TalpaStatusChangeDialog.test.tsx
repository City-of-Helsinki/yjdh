import '@testing-library/jest-dom';
import '../../../../test/i18n/i18n-test';

import { screen } from '@testing-library/react';
import {
  getDialog,
  getDialogButton,
} from 'benefit/handler/__tests__/utils/modal-test-helpers';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { INSTALMENT_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import TalpaStatusChangeDialog from '../TalpaStatusChangeDialog';

describe('TalpaStatusChangeDialog', () => {
  const headingText = 'Maksun tilan muutos';
  const bodyText =
    'Tuen automaattinen maksu on epäonnistunut. Palauta hakemus odottamaan automaattista Talpa-käsittelyä tai merkitse maksu suoritetuksi jolloin maksutapahtuma on vahvistettava manuaalisesti Talpalta.';
  const returnAsWaitingText = 'Palauta odottamaan';
  const markAsPaidText = 'Merkitse maksetuksi';
  const closeText = 'Sulje';

  const onClose = jest.fn();
  const onStatusChange = jest.fn();

  const renderSubject = (isOpen = true): void => {
    renderComponent(
      <TalpaStatusChangeDialog
        isOpen={isOpen}
        onClose={onClose}
        onStatusChange={onStatusChange}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog content and action buttons when open', () => {
    renderSubject(true);

    expect(getDialog()).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: headingText,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(bodyText)).toBeInTheDocument();

    expect(getDialogButton(returnAsWaitingText)).toBeInTheDocument();
    expect(getDialogButton(markAsPaidText)).toBeInTheDocument();
    expect(getDialogButton(closeText)).toBeInTheDocument();
  });

  it('does not render dialog content when closed', () => {
    renderSubject(false);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(headingText)).not.toBeInTheDocument();
  });

  it.each<readonly [string, string, INSTALMENT_STATUSES]>([
    [
      'ACCEPTED when return as waiting is clicked',
      returnAsWaitingText,
      INSTALMENT_STATUSES.ACCEPTED,
    ],
    [
      'PAID when mark as paid is clicked',
      markAsPaidText,
      INSTALMENT_STATUSES.PAID,
    ],
  ])(
    'calls onStatusChange with %s',
    async (_description, buttonName, status) => {
      const user = setupUserAndRender(() => renderSubject(true));

      await user.click(getDialogButton(buttonName));

      expect(onStatusChange).toHaveBeenCalledTimes(1);
      expect(onStatusChange).toHaveBeenCalledWith(status);
    }
  );

  it('calls onClose when close button is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject(true));

    await user.click(getDialogButton(closeText));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
