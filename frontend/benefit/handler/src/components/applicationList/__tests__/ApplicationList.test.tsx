import { screen, waitFor } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import useInstalmentStatusTransition from 'benefit/handler/hooks/useInstalmentStatusTransition';
import {
  APPLICATION_ORIGINS,
  APPLICATION_STATUSES,
  INSTALMENT_STATUSES,
  TALPA_STATUSES,
} from 'benefit-shared/constants';
import {
  AhjoError,
  ApplicationListItemData,
} from 'benefit-shared/types/application';
import React from 'react';

import ApplicationList, {
  ApplicationListProps,
  renderPaymentTagPerStatus,
} from '../ApplicationList';

jest.mock('benefit/handler/hooks/useInstalmentStatusTransition');

jest.mock(
  'react-loading-skeleton',
  () =>
    function MockSkeleton(): React.ReactElement {
      return <div data-testid="loading-skeleton" />;
    }
);

jest.mock(
  '../TalpaStatusChangeDialog',
  () =>
    function MockTalpaStatusChangeDialog({
      isOpen,
      onClose,
      onStatusChange,
    }: {
      isOpen: boolean;
      onClose: () => void;
      onStatusChange: (status: INSTALMENT_STATUSES) => void;
    }): React.ReactElement | null {
      if (!isOpen) return null;
      return (
        <div data-testid="talpa-status-modal">
          <button type="button" onClick={onClose}>
            close-status-modal
          </button>
          <button
            type="button"
            onClick={() => onStatusChange(INSTALMENT_STATUSES.PAID)}
          >
            confirm-status-change
          </button>
        </div>
      );
    }
);

const mutate = jest.fn();

const mockUseInstalmentStatusTransition =
  useInstalmentStatusTransition as jest.MockedFunction<
    typeof useInstalmentStatusTransition
  >;

const baseRow = {
  id: 'app-1',
  status: APPLICATION_STATUSES.HANDLING,
  companyName: 'Yritys Oy',
  companyId: '1234567-8',
  applicationNum: 42,
  employeeName: 'Maija Meikäläinen',
  unreadMessagesCount: 2,
} as ApplicationListItemData;

const initialProps: ApplicationListProps = {
  heading: 'Hakemukset',
  status: [APPLICATION_STATUSES.HANDLING],
  list: [],
  isLoading: false,
};

const renderSubject = (props: Partial<ApplicationListProps> = {}): void => {
  renderComponent(<ApplicationList {...initialProps} {...props} />);
};

const paymentRow = {
  ...baseRow,
  status: APPLICATION_STATUSES.ACCEPTED,
  unreadMessagesCount: 0,
  talpaStatus: TALPA_STATUSES.REJECTED_BY_TALPA,
  firstInstalment: { id: 'inst-1' } as never,
} as ApplicationListItemData;

const t = (key: string): string => key;

describe('ApplicationList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInstalmentStatusTransition.mockReturnValue({
      mutate,
      isSuccess: false,
    } as never);
  });

  it('renders loading state with heading and skeletons', () => {
    renderSubject({ isLoading: true });

    expect(screen.getByText('Hakemukset')).toBeInTheDocument();
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(2);
  });

  it('renders empty message when no applications are available', () => {
    renderSubject({ status: [APPLICATION_STATUSES.RECEIVED], list: [] });

    expect(
      screen.getByText('Ei yhtään saapunutta hakemusta.')
    ).toBeInTheDocument();
  });

  it('renders table rows and links unread messages to open drawer', () => {
    renderSubject({ list: [baseRow] });

    expect(
      screen.getByRole('heading', { name: 'Hakemukset (1)' })
    ).toBeInTheDocument();

    const companyLink = screen.getByRole('link', { name: 'Yritys Oy' });
    expect(companyLink).toHaveAttribute(
      'href',
      '/application?id=app-1&openDrawer=1'
    );

    const messageLink = screen.getByRole('link', { name: '2' });
    expect(messageLink).toHaveAttribute(
      'href',
      '/application?id=app-1&openDrawer=1'
    );
  });

  it('renders origin tag for received applications', () => {
    renderSubject({
      status: [APPLICATION_STATUSES.RECEIVED],
      list: [
        {
          ...baseRow,
          status: APPLICATION_STATUSES.RECEIVED,
          unreadMessagesCount: 0,
          applicationOrigin: APPLICATION_ORIGINS.APPLICANT,
        },
      ],
    });

    expect(screen.getByText('Digitaalinen')).toBeInTheDocument();
  });

  it('opens talpa modal and triggers instalment status change in payment view', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({
        inPayment: true,
        status: [APPLICATION_STATUSES.ACCEPTED],
        list: [paymentRow],
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'applications.list.columns.talpaStatuses.rejected_by_talpa',
      })
    );
    expect(screen.getByTestId('talpa-status-modal')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'confirm-status-change' })
    );

    expect(mutate).toHaveBeenCalledWith({
      id: 'inst-1',
      status: INSTALMENT_STATUSES.PAID,
    });
  });

  it('closes talpa modal when instalment status change succeeds (useEffect)', async () => {
    const user = setupUserAndRender(() => {
      // Use a controlled wrapper so the mock's isSuccess can flip without losing providers
      function TriggerWrapper(): React.ReactElement {
        const [success, setSuccess] = React.useState(false);
        mockUseInstalmentStatusTransition.mockReturnValue({
          mutate,
          isSuccess: success,
        } as never);
        return (
          <>
            <button
              type="button"
              aria-label="trigger-success"
              data-testid="trigger-success"
              onClick={() => setSuccess(true)}
            />
            <ApplicationList
              {...initialProps}
              inPayment
              status={[APPLICATION_STATUSES.ACCEPTED]}
              list={[paymentRow]}
            />
          </>
        );
      }

      renderComponent(<TriggerWrapper />);
    });

    await user.click(
      screen.getByRole('button', {
        name: 'applications.list.columns.talpaStatuses.rejected_by_talpa',
      })
    );
    expect(screen.getByTestId('talpa-status-modal')).toBeInTheDocument();

    // Flip isSuccess to true — TriggerWrapper re-renders and updates the mock before ApplicationList renders
    await user.click(screen.getByTestId('trigger-success'));

    await waitFor(() =>
      expect(screen.queryByTestId('talpa-status-modal')).not.toBeInTheDocument()
    );
  });

  it('closes talpa modal when onClose callback is triggered', async () => {
    const user = setupUserAndRender(() =>
      renderSubject({
        inPayment: true,
        status: [APPLICATION_STATUSES.ACCEPTED],
        list: [paymentRow],
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: 'applications.list.columns.talpaStatuses.rejected_by_talpa',
      })
    );
    expect(screen.getByTestId('talpa-status-modal')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'close-status-modal' })
    );

    expect(screen.queryByTestId('talpa-status-modal')).not.toBeInTheDocument();
  });

  it('renders modifiedAt column for draft applications', () => {
    renderSubject({
      status: [APPLICATION_STATUSES.DRAFT],
      list: [
        {
          ...baseRow,
          status: APPLICATION_STATUSES.DRAFT,
          unreadMessagesCount: 0,
          modifiedAt: '30.6.2024 12:00',
        },
      ],
    });

    expect(
      screen.getByRole('columnheader', { name: 'Tallennettu' })
    ).toBeInTheDocument();
    expect(screen.getByText('30.6.2024 12:00')).toBeInTheDocument();
  });

  it.each([
    { status: APPLICATION_STATUSES.ACCEPTED, label: 'accepted' },
    { status: APPLICATION_STATUSES.REJECTED, label: 'rejected' },
  ])('renders handledAt column for $label applications', ({ status }) => {
    renderSubject({
      status: [status],
      list: [
        {
          ...baseRow,
          status,
          unreadMessagesCount: 0,
          handledAt: '30.6.2024',
        },
      ],
    });

    expect(
      screen.getByRole('columnheader', { name: 'Käsitelty' })
    ).toBeInTheDocument();
    expect(screen.getByText('30.6.2024')).toBeInTheDocument();
  });

  it.each([
    {
      label: 'single object',
      ahjoError: {
        errorFromAhjo: {
          id: 'e1',
          context: 'ctx',
          message: 'Object error message',
        },
        modifiedAt: '2024-06-30T12:00:00Z',
        status: 'error',
      } as AhjoError,
      expected: 'Object error message',
    },
    {
      label: 'primitive string',
      ahjoError: {
        errorFromAhjo: 'raw string error' as never,
        modifiedAt: '2024-06-30T12:00:00Z',
        status: 'error',
      } as AhjoError,
      expected: 'raw string error',
    },
  ])(
    'renders ahjo error message when errorFromAhjo is a $label',
    async ({ ahjoError, expected }) => {
      const user = setupUserAndRender(() =>
        renderSubject({
          status: [APPLICATION_STATUSES.HANDLING],
          list: [{ ...baseRow, unreadMessagesCount: 0, ahjoError }],
        })
      );
      await user.click(
        screen.getByRole('button', { name: 'Avaa virheilmoitus näkyviin' })
      );
      expect(screen.getByText(expected)).toBeInTheDocument();
    }
  );

  it('strips the year from additionalInformationNeededBy and appends it to the status label', () => {
    renderSubject({
      status: [APPLICATION_STATUSES.INFO_REQUIRED],
      list: [
        {
          ...baseRow,
          status: APPLICATION_STATUSES.INFO_REQUIRED,
          unreadMessagesCount: 0,
          additionalInformationNeededBy: '30.6.2024',
        },
      ],
    });
    // dateForAdditionalInformationNeededBy('30.6.2024') → ' 30.6.'
    // full tag text: 'Odottaa lisätietoja 30.6.'
    expect(screen.getByText('Odottaa lisätietoja 30.6.')).toBeInTheDocument();
  });

  it('renders split instalment amounts when secondInstalment is present', () => {
    // calculatedBenefitAmount=5000, secondInstalment.amountAfterRecoveries=2000
    // → firstInstalment = 5000 - 2000 = 3000, total = 5000
    // getFirstInstalmentTotalAmount renders: "{3000 €} / {5000 €}"
    const secondInstalment = {
      id: 'inst-2',
      instalmentNumber: 2,
      amount: 2000,
      dueDate: '2024-12-31',
      amountAfterRecoveries: 2000,
      status: INSTALMENT_STATUSES.WAITING,
    };

    renderSubject({
      inPayment: true,
      status: [APPLICATION_STATUSES.ACCEPTED],
      list: [
        {
          ...baseRow,
          status: APPLICATION_STATUSES.ACCEPTED,
          unreadMessagesCount: 0,
          calculatedBenefitAmount: '5000',
          firstInstalment: { id: 'inst-1' } as never,
          secondInstalment,
        },
      ],
    });

    // The JSX fragment renders as two separate text nodes; assert each amount
    expect(screen.getByText(/3\s*000/)).toBeInTheDocument();
    expect(screen.getByText(/5\s*000/)).toBeInTheDocument();
  });
});

describe('renderPaymentTagPerStatus', () => {
  type Case = {
    label: string;
    talpaStatus: TALPA_STATUSES;
    id?: string;
    clickTalpaTag?: (id: string, s: TALPA_STATUSES) => void;
  };

  it.each<Case>([
    {
      label: 'non-rejected status',
      talpaStatus: TALPA_STATUSES.SUCCESFULLY_SENT_TO_TALPA,
      id: 'inst-1',
      clickTalpaTag: jest.fn(),
    },
    {
      label: 'missing id',
      talpaStatus: TALPA_STATUSES.REJECTED_BY_TALPA,
      clickTalpaTag: jest.fn(),
    },
    {
      label: 'missing clickTalpaTag handler',
      talpaStatus: TALPA_STATUSES.REJECTED_BY_TALPA,
      id: 'inst-1',
    },
  ])(
    'renders a non-clickable tag when $label',
    ({ talpaStatus, id, clickTalpaTag }) => {
      renderComponent(
        renderPaymentTagPerStatus(t as never, talpaStatus, id, clickTalpaTag)
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    }
  );

  it('calls clickTalpaTag when rejected tag is clicked', async () => {
    const clickTalpaTag = jest.fn();
    const user = setupUserAndRender(() =>
      renderComponent(
        renderPaymentTagPerStatus(
          t as never,
          TALPA_STATUSES.REJECTED_BY_TALPA,
          'inst-1',
          clickTalpaTag
        )
      )
    );
    await user.click(screen.getByRole('button'));
    expect(clickTalpaTag).toHaveBeenCalledWith(
      'inst-1',
      TALPA_STATUSES.REJECTED_BY_TALPA
    );
  });
});
