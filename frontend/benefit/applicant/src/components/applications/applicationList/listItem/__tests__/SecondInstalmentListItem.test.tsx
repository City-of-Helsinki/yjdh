import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'benefit/applicant/__tests__/utils/render-component';
import { ROUTES } from 'benefit/applicant/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import React from 'react';

import SecondInstalmentListItem from '../SecondInstalmentListItem';

const pushMock = jest.fn();

jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('hds-react', () => ({
  Button: ({
    children,
    iconLeft,
    onClick,
  }: {
    children: React.ReactNode;
    iconLeft?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {iconLeft}
      {children}
    </button>
  ),
  IconAlertCircleFill: () => <svg data-testid="warning-icon" />,
  IconPen: () => <svg data-testid="pen-icon" />,
}));

describe('SecondInstalmentListItem', () => {
  const defaultProps: ApplicationListItemData = {
    id: 'application-id',
    name: 'Test Employee',
    avatar: {
      initials: 'TE',
      color: 'summerDark',
    },
    contactPersonName: 'Test Contact',
    submittedAt: '1.4.2026',
    applicationNum: 123_456,
    secondInstalmentDueDate: '4.4.2026',
  };

  const getComponent = (
    props: Partial<ApplicationListItemData> = {}
  ): ReturnType<typeof renderComponent> =>
    renderComponent(<SecondInstalmentListItem {...defaultProps} {...props} />);

  it('renders employee column heading and employee name', () => {
    getComponent();

    expect(
      screen.getByText('common:applications.list.common.employee')
    ).toBeInTheDocument();
    expect(screen.getByText('Test Employee')).toBeInTheDocument();
  });

  it('renders application date column heading and submitted date', () => {
    getComponent();

    expect(
      screen.getByText('common:applications.list.common.sent')
    ).toBeInTheDocument();
    expect(screen.getByText('1.4.2026')).toBeInTheDocument();
  });

  it('renders application number column heading and application number', () => {
    getComponent();

    expect(
      screen.getByText('common:applications.list.common.applicationNumber')
    ).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('renders status column heading', () => {
    getComponent();

    expect(
      screen.getByText('common:applications.list.common.status')
    ).toBeInTheDocument();
  });

  it('renders status text with the second instalment due date', () => {
    getComponent();

    expect(
      screen.getByText((content) =>
        content.includes(
          'common:applications.list.secondInstalments.prompt1'
        ) &&
        content.includes('4.4.2026') &&
        content.includes('common:applications.list.secondInstalments.prompt2')
      )
    ).toBeInTheDocument();
  });

  it('renders avatar initials with contact person as title', () => {
    getComponent();

    const avatar = screen.getByTitle('Test Contact');

    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('TE');
  });

  it('renders answer button with pen icon and warning icon in status column', () => {
    getComponent();

    expect(
      screen.getByRole('button', {
        name: /common:applications\.list\.secondinstalments\.button/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId('pen-icon')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('navigates to application alteration when answer button is clicked', () => {
    getComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: /common:applications\.list\.secondinstalments\.button/i,
      })
    );

    expect(pushMock).toHaveBeenCalledWith(
      `${ROUTES.APPLICATION_ALTERATION}?id=application-id`
    );
  });
});
