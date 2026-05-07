import { renderHook } from '@testing-library/react-hooks';
import FrontPageContext from 'benefit/applicant/context/FrontPageContext';
import useApplicationsQuery from 'benefit/applicant/hooks/useApplicationsQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { ApplicationData } from 'benefit-shared/types/application';
import React from 'react';

import useApplicationList from '../useApplicationList';

jest.mock('benefit/applicant/hooks/useApplicationsQuery');
jest.mock('benefit/applicant/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('shared/hooks/useLocale', () => jest.fn(() => 'fi'));
jest.mock('shared/server/is-server-side', () => jest.fn(() => false));

const mockedUseApplicationsQuery = useApplicationsQuery as jest.MockedFunction<
  typeof useApplicationsQuery
>;

const getApplicationData = (
  overrides: Partial<ApplicationData> = {}
): ApplicationData =>
  ({
    id: 'application-id',
    status: APPLICATION_STATUSES.ACCEPTED,
    employee: {
      first_name: 'Test',
      last_name: 'Employee',
    },
    submitted_at: '2026-03-01',
    application_number: 123_456,
    unread_messages_count: 0,
    company_contact_person_first_name: 'Test',
    company_contact_person_last_name: 'Contact',
    second_instalment_due_date: '2026-04-18',
    ...overrides,
  } as ApplicationData);

describe('useApplicationList', () => {
  const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <FrontPageContext.Provider value={{ errors: [], setError: jest.fn() }}>
      {children}
    </FrontPageContext.Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('subtracts 15 days from second_instalment_due_date and formats it for UI', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [getApplicationData()],
      error: null,
      isLoading: false,
    } as ReturnType<typeof useApplicationsQuery>);

    const { result } = renderHook(
      () =>
        useApplicationList({
          status: [APPLICATION_STATUSES.ACCEPTED],
          secondInstalmentStatus: 'requested',
        }),
      { wrapper }
    );

    expect(result.current.list[0].secondInstalmentDueDate).toBe('3.4.2026');
  });

  it('sets secondInstalmentDueDate to dash when backend due date is missing', () => {
    mockedUseApplicationsQuery.mockReturnValue({
      data: [
        getApplicationData({
          second_instalment_due_date: undefined,
        }),
      ],
      error: null,
      isLoading: false,
    } as ReturnType<typeof useApplicationsQuery>);

    const { result } = renderHook(
      () =>
        useApplicationList({
          status: [APPLICATION_STATUSES.ACCEPTED],
          secondInstalmentStatus: 'requested',
        }),
      { wrapper }
    );

    expect(result.current.list[0].secondInstalmentDueDate).toBe('-');
  });
});
