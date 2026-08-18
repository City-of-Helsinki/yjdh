import { screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useInstalmentDateChange from 'benefit/handler/hooks/useInstalmentDateChange';
import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
import {
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { ApplicationListItemData } from 'benefit-shared/types/application';
import React from 'react';

import testI18n from '../../../../test/i18n/i18n-test';
import ApplicationListForInstalments, {
  renderInstalmentTagPerStatus,
} from '../ApplicationListForInstalments';

const mockRouterPush = jest.fn();

const LABELS = {
  selectFirstRow: 'select-first-row',
  cancelInstalment: 'Peru',
  confirm: 'Vahvista',
  changeDueDate: 'Muuta eräpäivää',
  cancelDialog: 'Peruuta',
};

const getButton = (name: string): HTMLElement =>
  screen.getByRole('button', { name });

const clickButton = async (
  user: { click: (element: Element) => Promise<void> },
  name: string
): Promise<void> => {
  await user.click(getButton(name));
};

const selectFirstRow = async (user: {
  click: (element: Element) => Promise<void>;
}): Promise<void> => {
  await clickButton(user, LABELS.selectFirstRow);
};

jest.mock('benefit/handler/hooks/useInstalmentStatusTransition', () =>
  jest.fn()
);
jest.mock('benefit/handler/hooks/useInstalmentDateChange', () => jest.fn());
jest.mock('../useApplicationList', () => ({
  useApplicationList: () => ({
    t: (key: string): string => String(testI18n.t(key, { defaultValue: key })),
    translationsBase: 'common:applications.list',
    getHeader: (id: string): string => `header.${id}`,
  }),
}));
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string): string => String(testI18n.t(key, { defaultValue: key })),
  }),
}));
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): JSX.Element {
      return <div data-testid="loading-skeleton" />;
    }
);

jest.mock(
  'shared/components/modal/Modal',
  () =>
    function MockModal({
      isOpen,
      customContent,
    }: {
      isOpen: boolean;
      customContent: React.ReactNode;
    }): JSX.Element | null {
      return isOpen ? <div data-testid="modal">{customContent}</div> : null;
    }
);

jest.mock('shared/components/table/Table.sc', () => ({
  $Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }): JSX.Element => <a href={href}>{children}</a>,
}));

jest.mock('hds-react', () => {
  const actual = jest.requireActual('hds-react');

  return {
    ...actual,
    Table: ({
      heading,
      rows,
      cols,
      setSelectedRows,
    }: {
      heading: string;
      rows: Array<{ id: string }>;
      cols?: Array<{
        key: string;
        transform?: (row: Record<string, unknown>) => React.ReactNode;
      }>;
      setSelectedRows?: (rows: string[]) => void;
    }): JSX.Element => (
      <div>
        <h2>{heading}</h2>
        {(cols || []).map((col) => (
          <div key={col.key} data-testid={`col-${col.key}`}>
            {col.transform
              ? col.transform(rows[0] as Record<string, unknown>)
              : null}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSelectedRows?.([rows[0]?.id || ''])}
        >
          select-first-row
        </button>
      </div>
    ),
  };
});

const changeStatusMutate = jest.fn();
const changeDateMutate = jest.fn();

const mockUseInstalmentStatusTransition =
  useInstalmentStatusTransition as jest.MockedFunction<
    typeof useInstalmentStatusTransition
  >;
const mockUseInstalmentDateChange =
  useInstalmentDateChange as jest.MockedFunction<
    typeof useInstalmentDateChange
  >;

const baseListRow: ApplicationListItemData = {
  id: 'app-1',
  companyName: 'Company One',
  companyId: '1234567-8',
  applicationNum: 100,
  employeeName: 'Employee One',
  unreadMessagesCount: 1,
  status: APPLICATION_STATUSES.ACCEPTED,
  alterations: [{ state: 'received' }] as never,
  secondInstalment: {
    id: 'inst-1',
    dueDate: '2025-06-15',
    status: INSTALMENT_STATUSES.ACCEPTED,
    amount: '200.00',
    amountAfterRecoveries: '200.00',
  } as never,
} as ApplicationListItemData;

const createListRow = (overrides?: {
  status?: string;
  withoutInstalmentId?: boolean;
}): ApplicationListItemData => ({
  ...baseListRow,
  secondInstalment: {
    ...baseListRow.secondInstalment,
    status: overrides?.status ?? INSTALMENT_STATUSES.ACCEPTED,
    id: overrides?.withoutInstalmentId ? undefined : 'inst-1',
  } as never,
});

const listRow = createListRow();
const listRowWithoutInstalmentId = createListRow({
  withoutInstalmentId: true,
});
const waitingListRow = createListRow({
  status: INSTALMENT_STATUSES.WAITING,
});
const waitingListRowWithoutInstalmentId = createListRow({
  status: INSTALMENT_STATUSES.WAITING,
  withoutInstalmentId: true,
});

const t = (key: string): string =>
  String(testI18n.t(key, { defaultValue: key }));

describe('ApplicationListForInstalments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterPush.mockReset();
    mockUseInstalmentStatusTransition.mockReturnValue({
      mutate: changeStatusMutate,
      isLoading: false,
    } as never);
    mockUseInstalmentDateChange.mockReturnValue({
      mutate: changeDateMutate,
    } as never);
  });

  it('renders loading state with heading and skeletons', () => {
    renderComponent(
      <ApplicationListForInstalments
        heading="Second instalments"
        list={[]}
        isLoading
      />
    );

    expect(screen.getByText('Second instalments')).toBeInTheDocument();
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(2);
  });

  it('renders empty state when list has no rows', () => {
    renderComponent(
      <ApplicationListForInstalments
        heading="Second instalments"
        list={[]}
        isLoading={false}
      />
    );

    expect(
      screen.getByText('Ei yhtään maksua odottavaa maksuerää.')
    ).toBeInTheDocument();
  });

  it('renders instalment status helper output for existing and missing status', () => {
    expect(
      renderInstalmentTagPerStatus(t as never, INSTALMENT_STATUSES.ACCEPTED)
    ).toBeTruthy();
    expect(renderInstalmentTagPerStatus(t as never)).toBe('');
  });

  it('renders transformed table values for first row', () => {
    renderComponent(
      <ApplicationListForInstalments
        heading="Second instalments"
        list={[listRow]}
        isLoading={false}
      />
    );

    const companyLink = screen.getByRole('link', { name: 'Company One' });
    expect(companyLink).toHaveAttribute(
      'href',
      expect.stringContaining('/application?id=app-1')
    );
    expect(companyLink).toHaveAttribute(
      'href',
      expect.stringContaining('returnTab=')
    );
    expect(companyLink).toHaveAttribute(
      'href',
      expect.stringContaining('openDrawer=1')
    );
    expect(screen.getByText('Hyväksytty')).toBeInTheDocument();
    expect(screen.getByText('15.6.2025')).toBeInTheDocument();
  });

  it('opens cancel modal and submits cancelled status for selected instalment', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <ApplicationListForInstalments
          heading="Second instalments"
          list={[waitingListRow]}
          isLoading={false}
        />
      )
    );

    await selectFirstRow(user);
    await clickButton(user, LABELS.cancelInstalment);
    await clickButton(user, LABELS.confirm);

    expect(changeStatusMutate).toHaveBeenCalledWith({
      id: 'inst-1',
      status: INSTALMENT_STATUSES.CANCELLED,
    });
  });

  it('closes cancel modal without status mutation when instalment id is missing', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <ApplicationListForInstalments
          heading="Second instalments"
          list={[waitingListRowWithoutInstalmentId]}
          isLoading={false}
        />
      )
    );

    await selectFirstRow(user);
    await clickButton(user, LABELS.cancelInstalment);
    await clickButton(user, LABELS.confirm);

    expect(changeStatusMutate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('opens change date dialog and submits due date update', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <ApplicationListForInstalments
          heading="Second instalments"
          list={[listRow]}
          isLoading={false}
        />
      )
    );

    await selectFirstRow(user);
    await clickButton(user, LABELS.changeDueDate);

    expect(screen.getByText('Eräpäivän muutos')).toBeInTheDocument();

    await clickButton(user, LABELS.confirm);

    expect(changeDateMutate).toHaveBeenCalledWith({
      id: 'inst-1',
      dueDate: '2025-06-15',
    });
  });

  it('closes change date dialog from cancel button and skips mutation without instalment id', async () => {
    const user = setupUserAndRender(() =>
      renderComponent(
        <ApplicationListForInstalments
          heading="Second instalments"
          list={[listRowWithoutInstalmentId]}
          isLoading={false}
        />
      )
    );

    await selectFirstRow(user);
    await clickButton(user, LABELS.changeDueDate);

    await clickButton(user, LABELS.cancelDialog);
    expect(screen.queryByText('Eräpäivän muutos')).not.toBeInTheDocument();

    await clickButton(user, LABELS.changeDueDate);
    await clickButton(user, LABELS.confirm);

    expect(changeDateMutate).not.toHaveBeenCalled();
  });
});
