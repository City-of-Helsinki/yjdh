import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import useChangeHandlerMutation from 'benefit/handler/hooks/useChangeHandlerMutation';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

jest.mock('benefit/handler/hooks/useChangeHandlerMutation');

const mutate = jest.fn();

const mockUseChangeHandlerMutation =
  useChangeHandlerMutation as jest.MockedFunction<
    typeof useChangeHandlerMutation
  >;

const createApplication = (overrides: Partial<Application> = {}): Application =>
  ({
    id: 'app-id',
    applicationNumber: 42,
    status: APPLICATION_STATUSES.ACCEPTED,
    archived: false,
    company: {
      name: 'Yritys Oy',
      businessId: '1234567-8',
    },
    employee: {
      firstName: 'Maija',
      lastName: 'Meikäläinen',
    },
    handler: {
      firstName: 'Matti',
      lastName: 'Mallikas',
    },
    submittedAt: '2024-06-30',
    additionalInformationNeededBy: '2024-12-31',
    ...overrides,
  } as Application);

const baseApplication = createApplication();

const renderSubject = ({
  data = baseApplication,
  isApplicationReadOnly = false,
}: {
  data?: Application;
  isApplicationReadOnly?: boolean;
} = {}): RenderResult =>
  renderComponent(
    <ApplicationHeader
      data={data}
      isApplicationReadOnly={isApplicationReadOnly}
    />
  ).renderResult;

describe('ApplicationHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChangeHandlerMutation.mockReturnValue({ mutate } as never);
  });

  it('renders nothing when application number is missing', () => {
    const { container } = renderSubject({
      data: createApplication({ applicationNumber: undefined }),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when application is draft', () => {
    const { container } = renderSubject({
      data: createApplication({ status: APPLICATION_STATUSES.DRAFT }),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders application details and status label', () => {
    renderSubject();

    [
      'Työnantaja',
      'Yritys Oy',
      'Y-tunnus',
      '1234567-8',
      'Hakemus',
      '42',
      'Työllistettävä',
      'Maija Meikäläinen',
      'Käsittelijä',
      'Matti Mallikas',
      'Saapunut',
      '30.6.2024',
      'Myönteinen',
    ].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('shows read-only handler mismatch notice and takes control on click', async () => {
    const user = setupUserAndRender(() => {
      renderSubject({ isApplicationReadOnly: true });
    });

    expect(
      screen.getByText(
        'Matti M. käsittelee hakemusta. Muutosten tekeminen on estetty.'
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ota käsittelyyn' }));

    expect(mutate).toHaveBeenCalledWith('app-id');
  });

  it('shows info required notice with lock date', () => {
    renderSubject({
      data: createApplication({
        status: APPLICATION_STATUSES.INFO_REQUIRED,
        additionalInformationNeededBy: '2024-12-31',
      }),
    });

    expect(
      screen.getByText('Hakemus avattu muokattavaksi ja lukittuu 31.12.2024')
    ).toBeInTheDocument();
  });
});
