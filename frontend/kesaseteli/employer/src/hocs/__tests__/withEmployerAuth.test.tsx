import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import React from 'react';

import withEmployerAuth from '../withEmployerAuth';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('shared/components/hocs/withAuth', () =>
  jest.fn((comp) => {
    const AuthComp = (props: Record<string, unknown>): React.ReactElement => (
      <div data-testid="with-auth-wrapper">
        {React.createElement(comp as React.ComponentType, props)}
      </div>
    );
    AuthComp.displayName = 'WithAuth';
    return AuthComp;
  })
);

jest.mock('../withOrganisation', () =>
  jest.fn((comp) => {
    const OrgComp = (props: Record<string, unknown>): React.ReactElement => (
      <div data-testid="with-organisation-wrapper">
        {React.createElement(comp as React.ComponentType, props)}
      </div>
    );
    OrgComp.displayName = 'WithOrganisation';
    return OrgComp;
  })
);

describe('withEmployerAuth', () => {
  const DummyComponent: React.FC = () => (
    <div data-testid="dummy-component">Dummy</div>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the wrapped component directly without auth/org HOCs on /login page', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/login',
    });

    const EnhancedComponent = withEmployerAuth(DummyComponent);
    const { getByTestId, queryByTestId } = render(<EnhancedComponent />);

    expect(getByTestId('dummy-component')).toBeInTheDocument();
    expect(queryByTestId('with-auth-wrapper')).not.toBeInTheDocument();
    expect(queryByTestId('with-organisation-wrapper')).not.toBeInTheDocument();
  });

  it('renders the wrapped component directly without auth/org HOCs on /no-organisation page', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/no-organisation',
    });

    const EnhancedComponent = withEmployerAuth(DummyComponent);
    const { getByTestId, queryByTestId } = render(<EnhancedComponent />);

    expect(getByTestId('dummy-component')).toBeInTheDocument();
    expect(queryByTestId('with-auth-wrapper')).not.toBeInTheDocument();
    expect(queryByTestId('with-organisation-wrapper')).not.toBeInTheDocument();
  });

  it('renders wrapped component within withAuth and withOrganisation wrappers on other pages (e.g. /dashboard)', () => {
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/dashboard',
    });

    const EnhancedComponent = withEmployerAuth(DummyComponent);
    const { getByTestId } = render(<EnhancedComponent />);

    expect(getByTestId('dummy-component')).toBeInTheDocument();
    expect(getByTestId('with-auth-wrapper')).toBeInTheDocument();
    expect(getByTestId('with-organisation-wrapper')).toBeInTheDocument();
  });
});
