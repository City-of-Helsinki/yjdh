import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import useLocale from 'shared/hooks/useLocale';
import useMediaQuery from 'shared/hooks/useMediaQuery';

import {
  fakeActivityLogItem,
  fakeNotes,
} from '../../../__tests__/utils/backend/fake-notes';
import useApplicationTimelineQuery from '../../../hooks/backend/useApplicationTimelineQuery';
import ApplicationSidebar from '../ApplicationSidebar';

jest.mock('../../../hooks/backend/useApplicationTimelineQuery');
jest.mock('shared/hooks/useLocale', () => jest.fn());
jest.mock('shared/hooks/useMediaQuery', () => jest.fn());

const mockTimelineNotes = [
  ...fakeNotes(1, [
    {
      content: 'timeline note 1 content',
    },
  ]),
  fakeActivityLogItem({
    old_value: 'submitted',
    new_value: 'additional_information_requested',
  }),
];

describe('ApplicationSidebar', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocale as jest.Mock).mockReturnValue('fi');
    (useMediaQuery as jest.Mock).mockReturnValue(false);
    (useApplicationTimelineQuery as jest.Mock).mockReturnValue({
      data: mockTimelineNotes,
      isLoading: false,
    });
  });

  it('renders ear toggle button and timeline content', () => {
    renderComponent(
      <ApplicationSidebar
        applicationId="app-1"
        applicationType="youth"
        isOpen
        onToggle={mockOnToggle}
      />
    );

    const earButton = screen.getByTestId('sidebar-ear-button');
    expect(earButton).toBeInTheDocument();

    expect(screen.getByText('timeline note 1 content')).toBeInTheDocument();
  });

  it('calls onToggle when ear button is clicked', async () => {
    renderComponent(
      <ApplicationSidebar
        applicationId="app-1"
        applicationType="youth"
        isOpen
        onToggle={mockOnToggle}
      />
    );

    const earButton = screen.getByTestId('sidebar-ear-button');
    await userEvent.click(earButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('calls onToggle when timeline note link is clicked to close sidebar', async () => {
    renderComponent(
      <ApplicationSidebar
        applicationId="app-1"
        applicationType="youth"
        isOpen
        onToggle={mockOnToggle}
      />
    );

    const link = screen.getByRole('link', { name: /siirry huomioon/i });
    await userEvent.click(link);

    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('renders activity log items correctly', () => {
    renderComponent(
      <ApplicationSidebar
        applicationId="app-1"
        applicationType="youth"
        isOpen
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Tilamuutos')).toBeInTheDocument();

    // Test for the prefix text first
    expect(screen.getByText(/tila muuttunut:/i)).toBeInTheDocument();

    // The inner content within Trans components should be accessible via regular getByText
    expect(screen.getByText('Lähetetty')).toBeInTheDocument();
    expect(screen.getByText('Lisätietoja pyydetty')).toBeInTheDocument();

    // Verify 'Siirry huomioon' is NOT present for the activity item.
    // There is one note and one activity, so there should only be one 'Siirry huomioon' link.
    expect(
      screen.getByRole('link', { name: /siirry huomioon/i })
    ).toBeInTheDocument();
  });
});
