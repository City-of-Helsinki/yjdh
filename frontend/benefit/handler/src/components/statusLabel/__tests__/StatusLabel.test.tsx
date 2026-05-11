import '@testing-library/jest-dom';
import '../../../../test/i18n/i18n-test';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import StatusLabel from '../StatusLabel';

const STATUS_TEXTS = {
  [APPLICATION_STATUSES.DRAFT]: 'Luonnos',
  [APPLICATION_STATUSES.INFO_REQUIRED]: 'Odottaa lisätietoja',
  [APPLICATION_STATUSES.RECEIVED]: 'Saapunut',
  [APPLICATION_STATUSES.ACCEPTED]: 'Myönteinen',
  [APPLICATION_STATUSES.REJECTED]: 'Kielteinen',
  [APPLICATION_STATUSES.CANCELLED]: 'Peruutettu',
  [APPLICATION_STATUSES.HANDLING]: 'Käsittelyssä',
  [APPLICATION_STATUSES.ARCHIVAL]: 'Myönteinen',
};

const getStatusLabel = (text: string): HTMLElement => screen.getByText(text);

const renderSubject = (
  status: APPLICATION_STATUSES,
  archived?: boolean
): ReturnType<typeof renderComponent> =>
  renderComponent(<StatusLabel status={status} archived={archived} />);

describe('StatusLabel', () => {
  it.each(Object.values(APPLICATION_STATUSES).filter((s) => s in STATUS_TEXTS))(
    'renders translated label for status %s',
    (status) => {
      renderSubject(status as APPLICATION_STATUSES);

      expect(getStatusLabel(STATUS_TEXTS[status])).toBeInTheDocument();
    }
  );

  it('appends archive suffix when archived is true', () => {
    renderSubject(APPLICATION_STATUSES.ACCEPTED, true);

    expect(
      getStatusLabel(`${STATUS_TEXTS[APPLICATION_STATUSES.ACCEPTED]} / arkisto`)
    ).toBeInTheDocument();
  });

  it.each([false, undefined])(
    'does not append archive suffix when archived is %s',
    (archived) => {
      renderSubject(APPLICATION_STATUSES.ACCEPTED, archived);

      expect(
        getStatusLabel(STATUS_TEXTS[APPLICATION_STATUSES.ACCEPTED])
      ).toBeInTheDocument();
      expect(screen.queryByText(/arkisto/)).not.toBeInTheDocument();
    }
  );
});
