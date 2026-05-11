import { RenderResult, screen } from '@testing-library/react';
import { createHandledAlteration } from 'benefit/handler/__tests__/utils/alteration-fixtures';
import {
  clickDialogButton,
  getDialog,
  getDialogButton,
} from 'benefit/handler/__tests__/utils/modal-test-helpers';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import { ApplicationAlteration } from 'benefit-shared/types/application';
import React from 'react';

import AlterationCancelModal from '../AlterationCancelModal';

const onClose = jest.fn();
const onSetCancelled = jest.fn();

const labels = {
  body: 'Toiminto ei poista Talpaan lahetettya takaisinlaskutuspyyntoa. Ota yhteytta Talpaan ennen kuin peruutat kasitellyn muutosilmoituksen, mikali olet lahettanyt takaisinlaskupyynnon. Jos jatkat, muutosilmoitus nakyy kasittelijan jarjestelmassa peruttuna ja poistuu hakijan nakymasta.',
  confirm: 'Peruuta',
  close: 'Takaisin, älä peruuta',
  loading: 'Poistetaan...',
};

const baseAlteration: ApplicationAlteration = createHandledAlteration();

const renderSubject = (
  alteration: ApplicationAlteration = baseAlteration,
  isDeleting = false
): RenderResult =>
  renderComponent(
    <AlterationCancelModal
      isOpen
      onClose={onClose}
      onSetCancelled={onSetCancelled}
      isDeleting={isDeleting}
      alteration={alteration}
    />
  ).renderResult;

describe('AlterationCancelModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      name: 'suspension title with date range',
      alteration: baseAlteration,
      title:
        'Haluatko varmasti peruuttaa käsitellyn ilmoituksen työsuhteen keskeytymisestä 30.6.2024–15.7.2024?',
    },
    {
      name: 'termination title with end date',
      alteration: {
        ...baseAlteration,
        alterationType: ALTERATION_TYPE.TERMINATION,
        resumeDate: undefined,
      } as ApplicationAlteration,
      title:
        'Haluatko varmasti peruuttaa käsitellyn ilmoituksen työsuhteen päättymisestä 30.6.2024?',
    },
  ])('renders $name', ({ alteration, title }) => {
    renderSubject(alteration);

    const dialog = getDialog();

    expect(dialog).toHaveTextContent(title);
    expect(dialog).toHaveTextContent(
      /Toiminto ei poista Talpaan lahetettya|Toiminto ei poista Talpaan lähetettyä/
    );
    expect(getDialogButton(labels.close)).toBeInTheDocument();
    expect(getDialogButton(labels.confirm)).toBeInTheDocument();
  });

  it('calls onClose when the secondary action is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await clickDialogButton(labels.close, user);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSetCancelled).not.toHaveBeenCalled();
  });

  it('calls onSetCancelled when the danger action is clicked', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await clickDialogButton(labels.confirm, user);

    expect(onSetCancelled).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables both actions while cancellation is in progress', () => {
    renderSubject(baseAlteration, true);

    expect(screen.getByRole('button', { name: labels.close })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.loading })).toBeDisabled();
  });
});
