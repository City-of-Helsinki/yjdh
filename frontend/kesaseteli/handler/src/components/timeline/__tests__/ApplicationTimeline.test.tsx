import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';

import {
  fakeActivityLogItem,
  fakeNotes,
} from '../../../__tests__/utils/backend/fake-notes';
import useApplicationTimelineQuery from '../../../hooks/backend/useApplicationTimelineQuery';
import useUser from '../../../hooks/useUser';
import { APPLICATION_LIST_TYPES } from '../../../types/application';
import { ActionType } from '../../../types/timeline';
import ApplicationTimeline from '../ApplicationTimeline';

jest.mock('shared/hooks/useLocale', () => jest.fn());
jest.mock('../../../hooks/useUser');
jest.mock('../../../hooks/backend/useApplicationTimelineQuery');

describe('ApplicationTimeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useUser as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        given_name: 'Test',
        family_name: 'User',
        name: 'Test User',
      },
    });
  });

  it('renders all notes', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: fakeNotes(4),
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.getByText('note 1')).toBeInTheDocument();
    expect(screen.getByText('note 2')).toBeInTheDocument();
    expect(screen.getByText('note 3')).toBeInTheDocument();
    expect(screen.getByText('note 4')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /näytä kaikki/i })
    ).not.toBeInTheDocument();
  });

  it('renders application status changes', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: [
        fakeActivityLogItem({
          old_value: 'submitted',
          new_value: 'additional_information_requested',
        }),
      ],
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.getByText('Tilamuutos')).toBeInTheDocument();
    expect(screen.getByText(/tila muuttunut:/i)).toBeInTheDocument();
    expect(screen.getByText('Uusi hakemus')).toBeInTheDocument();
    expect(screen.getByText('Lisätietoja pyydetty')).toBeInTheDocument();
  });

  it('renders assignee assignment event', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: [
        fakeActivityLogItem({
          action_type: ActionType.ASSIGNEE_CHANGE,
          old_value: '',
          new_value: 'William Meyer',
        }),
      ],
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.getByText('Käsittelijä')).toBeInTheDocument();
    expect(screen.getByText(/käsittelijäksi asetettu:/i)).toBeInTheDocument();
    expect(screen.getByText('William Meyer')).toBeInTheDocument();
  });

  it('renders assignee reassignment event', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: [
        fakeActivityLogItem({
          action_type: ActionType.ASSIGNEE_CHANGE,
          old_value: 'Old Handler',
          new_value: 'New Handler',
        }),
      ],
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.getByText('Käsittelijä')).toBeInTheDocument();
    expect(screen.getByText(/käsittelijä vaihdettu:/i)).toBeInTheDocument();
    expect(screen.getByText('Old Handler')).toBeInTheDocument();
    expect(screen.getByText('New Handler')).toBeInTheDocument();
  });

  it('renders assignee unassignment event', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: [
        fakeActivityLogItem({
          action_type: ActionType.ASSIGNEE_CHANGE,
          old_value: 'William Meyer',
          new_value: '',
        }),
      ],
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.getByText('Käsittelijä')).toBeInTheDocument();
    expect(screen.getByText(/käsittelijä tyhjennetty:/i)).toBeInTheDocument();
    expect(screen.getByText('William Meyer')).toBeInTheDocument();
  });

  it('skips activity items with unknown or unhandled action_type', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: [
        fakeActivityLogItem({
          action_type: 'unknown_action' as unknown as ActionType,
          old_value: 'old',
          new_value: 'new',
        }),
      ],
    });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(screen.queryByText('Tilamuutos')).not.toBeInTheDocument();
    expect(screen.queryByText('Käsittelijä')).not.toBeInTheDocument();
  });

  it('displays the empty timeline state when there are no entries', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({ data: [] });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(
      screen.getByText(/ei vielä tapahtumia aikajanalla/i)
    ).toBeInTheDocument();
  });

  it('renders heading and description note', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({ data: [] });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Aikajana' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hakemuksen koko historia yhtenä listana: tilamuutokset, käsittelijän huomiot, hakijalle lähetetyt viestit ja liitteet uusin ensin.'
      )
    ).toBeInTheDocument();
  });

  it('allows overriding title and description via props', () => {
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({ data: [] });
    renderComponent(
      <ApplicationTimeline
        applicationId="test-id"
        applicationType={APPLICATION_LIST_TYPES.EMPLOYER}
        title="Oma otsikko"
        description="Oma kuvaus"
      />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Oma otsikko' })
    ).toBeInTheDocument();
    expect(screen.getByText('Oma kuvaus')).toBeInTheDocument();
  });
});
