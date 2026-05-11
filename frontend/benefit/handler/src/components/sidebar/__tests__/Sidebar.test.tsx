import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { Application } from 'benefit/handler/types/application';
import { MESSAGE_TYPES } from 'benefit-shared/constants';
import { Message } from 'benefit-shared/types/application';
import React from 'react';

import i18n from '../../../../test/i18n/i18n-test';
import Sidebar from '../Sidebar';
import { useSidebar as useSidebarImpl } from '../useSidebar';

jest.mock('../useSidebar');

const useSidebar = jest.mocked(useSidebarImpl);

const handleSendMessage = jest.fn();
const handleCreateNote = jest.fn();
const handleMarkMessagesRead = jest.fn() as jest.MockedFunction<
  ReturnType<typeof useSidebarImpl>['handleMarkMessagesRead']
>;
const handleMarkLastMessageUnread = jest.fn() as jest.MockedFunction<
  ReturnType<typeof useSidebarImpl>['handleMarkLastMessageUnread']
>;

const makeMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  createdAt: '2024-01-01T00:00:00Z',
  modifiedAt: '2024-01-01T00:00:00Z',
  messageType: MESSAGE_TYPES.HANDLER_MESSAGE,
  content: 'Testi viesti',
  ...overrides,
});

const defaultApplication: Application = {
  id: 'app-123',
  changes: [],
};

type RenderOptions = {
  isOpen?: boolean;
  messagesReadOnly?: boolean;
  onClose?: jest.Mock;
  application?: Application;
  customItemsMessages?: React.ReactNode[];
  customItemsNotes?: React.ReactNode[];
};

const renderSubject = ({
  isOpen = true,
  messagesReadOnly,
  onClose = jest.fn(),
  application = defaultApplication,
  customItemsMessages,
  customItemsNotes,
}: RenderOptions = {}): ReturnType<typeof renderComponent> =>
  renderComponent(
    <Sidebar
      isOpen={isOpen}
      messagesReadOnly={messagesReadOnly}
      onClose={onClose}
      application={application}
      customItemsMessages={customItemsMessages}
      customItemsNotes={customItemsNotes}
    />
  );

const getMessagesTab = (): HTMLElement =>
  screen.getByRole('tab', { name: 'Viestit' });

const getNotesTab = (): HTMLElement =>
  screen.getByRole('tab', { name: 'Muistiinpanot' });

const getChangesTab = (): HTMLElement =>
  screen.getByRole('tab', { name: 'Muutoshistoria' });

const getMarkAsUnreadButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Merkitse lukemattomaksi' });

const queryMarkAsUnreadButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: 'Merkitse lukemattomaksi' });

const getSendButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Lähetä' });

const mockUseSidebar = (
  overrides: Partial<ReturnType<typeof useSidebarImpl>> = {}
): void => {
  useSidebar.mockReturnValue({
    t: i18n.t.bind(i18n),
    messages: [],
    notes: [],
    handleSendMessage,
    handleCreateNote,
    handleMarkMessagesRead,
    handleMarkLastMessageUnread,
    ...overrides,
  });
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSidebar();
  });

  it('renders nothing when isOpen is false', () => {
    renderSubject({ isOpen: false });

    expect(
      screen.queryByRole('tab', { name: 'Viestit' })
    ).not.toBeInTheDocument();
  });

  it('renders three tabs when open', () => {
    renderSubject();

    expect(getMessagesTab()).toBeInTheDocument();
    expect(getNotesTab()).toBeInTheDocument();
    expect(getChangesTab()).toBeInTheDocument();
  });

  it('calls handleMarkMessagesRead when opened', () => {
    renderSubject({ isOpen: true });

    expect(handleMarkMessagesRead).toHaveBeenCalled();
  });

  it('does not call handleMarkMessagesRead when closed', () => {
    renderSubject({ isOpen: false });

    expect(handleMarkMessagesRead).not.toHaveBeenCalled();
  });

  it('renders send button when not messagesReadOnly', () => {
    renderSubject({ messagesReadOnly: false });

    expect(getSendButton()).toBeInTheDocument();
  });

  it('does not render send button when messagesReadOnly', () => {
    renderSubject({ messagesReadOnly: true });

    expect(
      screen.queryByRole('button', { name: 'Lähetä' })
    ).not.toBeInTheDocument();
  });

  it('renders markAsUnread button disabled when there are no applicant messages', () => {
    mockUseSidebar();
    renderSubject();

    expect(getMarkAsUnreadButton()).toBeDisabled();
  });

  it('renders markAsUnread button enabled when applicant messages exist', () => {
    mockUseSidebar({
      messages: [makeMessage({ messageType: MESSAGE_TYPES.APPLICANT_MESSAGE })],
    });
    renderSubject();

    expect(getMarkAsUnreadButton()).toBeEnabled();
  });

  it('calls handleMarkLastMessageUnread and onClose when markAsUnread button is clicked', async () => {
    const onClose = jest.fn();
    mockUseSidebar({
      messages: [makeMessage({ messageType: MESSAGE_TYPES.APPLICANT_MESSAGE })],
    });
    const user = setupUserAndRender(() => renderSubject({ onClose }));

    await user.click(getMarkAsUnreadButton());

    expect(handleMarkLastMessageUnread).toHaveBeenCalledTimes(1);
    expect(handleMarkLastMessageUnread).toHaveBeenCalledWith(undefined, {
      onSuccess: onClose,
    });
  });

  it('does not render markAsUnread button when messagesReadOnly', () => {
    renderSubject({ messagesReadOnly: true });

    expect(queryMarkAsUnreadButton()).not.toBeInTheDocument();
  });

  it('renders custom message items when provided', () => {
    renderSubject({
      customItemsMessages: [<span key="custom">Mukautettu toiminto</span>],
    });

    expect(screen.getByText('Mukautettu toiminto')).toBeInTheDocument();
  });
});
