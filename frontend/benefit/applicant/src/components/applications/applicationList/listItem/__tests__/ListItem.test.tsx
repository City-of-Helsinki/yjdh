import { screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/applicant/__tests__/utils/user-render-helper';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import React from 'react';

import ListItem from '../ListItem';

const employeeName = 'Matti Meikalainen';
const modifiedAt = '01.01.2026';
const submittedAt = '02.01.2026';
const applicationNumber = '12345';
const statusText = 'Käsittelyssä';
const validUntil = '31.12.2026';
const editActionText = 'Muokkaa';
const employeeHeaderText = 'Työllistetty';
const savedHeaderText = 'Tallennettu';
const sentHeaderText = 'Lähetetty';
const applicationNumberHeaderText = 'Hakemusnumero';
const statusHeaderText = 'Tila';
const validUntilHeaderText = 'Tukiaika päättyy';

const defaultProps: React.ComponentProps<typeof ListItem> = {
  id: 'application-1',
  name: employeeName,
  contactPersonName: employeeName,
  avatar: { initials: 'MM', color: 'coatOfArms' },
  modifiedAt,
  submittedAt,
  applicationNum: 12_345,
  status: APPLICATION_STATUSES.RECEIVED,
  statusText,
  validUntil,
  allowedAction: {
    label: editActionText,
    handleAction: jest.fn(),
  },
  unreadMessagesCount: 0,
};

const detailFields = [
  [employeeHeaderText, employeeName],
  [savedHeaderText, modifiedAt],
  [sentHeaderText, submittedAt],
  [applicationNumberHeaderText, applicationNumber],
  [statusHeaderText, statusText],
  [validUntilHeaderText, validUntil],
] as const;

const renderLoading = (): ReturnType<typeof renderComponent> =>
  renderComponent(<ListItem isLoading />);

const renderListItem = (
  props: Partial<React.ComponentProps<typeof ListItem>> = {}
): ReturnType<typeof renderComponent> =>
  renderComponent(<ListItem {...defaultProps} {...props} />);

const getEditButton = (): HTMLElement =>
  screen.getByTestId('application-edit-button');

const expectDetailFields = (): void => {
  detailFields.forEach(([label, value]) => {
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
  });
};

describe('ListItem', () => {
  it('renders loading state when isLoading is true', () => {
    renderLoading();

    expect(screen.queryByText(employeeHeaderText)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('application-edit-button')
    ).not.toBeInTheDocument();
  });

  it('renders application item details and status information', () => {
    renderListItem();

    expectDetailFields();
    expect(getEditButton()).toHaveTextContent(editActionText);
  });

  it('calls allowed action with openDrawer false when edit button is clicked', async () => {
    const handleAction = jest.fn();
    const user = setupUserAndRender(() => {
      renderListItem({
        allowedAction: {
          label: editActionText,
          handleAction,
        },
      });
    });

    await user.click(getEditButton());

    expect(handleAction).toHaveBeenCalledWith(false);
  });

  it('renders unread message info and opens drawer action when clicked', async () => {
    const handleAction = jest.fn();
    const user = setupUserAndRender(() => {
      renderListItem({
        allowedAction: {
          label: editActionText,
          handleAction,
        },
        unreadMessagesCount: 2,
      });
    });

    const unreadMessagesText = screen.getByText('2 uutta');
    expect(unreadMessagesText).toBeInTheDocument();

    await user.click(unreadMessagesText);

    expect(handleAction).toHaveBeenCalledWith(true);
  });

  it('does not render unread message info when count is zero', () => {
    renderListItem({ unreadMessagesCount: 0 });

    expect(screen.queryByText('0 uutta')).not.toBeInTheDocument();
  });
});
