import renderComponent from 'benefit-shared/__tests__/utils/render-component';
import DecisionSummary from 'benefit-shared/components/decisionSummary/DecisionSummary';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  AlterationAccordionItemProps,
  Application,
  DecisionDetailList,
} from 'benefit-shared/types/application';
import React from 'react';
import { screen, userEvent } from 'shared/__tests__/utils/test-utils';

const ItemComponent: React.FC<AlterationAccordionItemProps> = ({ alteration }) => (
  <div data-testid="alteration-item">{`${alteration.id}-${alteration.endDate}`}</div>
);

describe('DecisionSummary', () => {
  const baseApplication: Application = {
    id: 'application-id',
    status: APPLICATION_STATUSES.ACCEPTED,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    handledByAhjoAutomation: true,
    ahjoCaseId: 'HEL 2024-1',
    alterations: [],
  } as Application;

  const detailList: DecisionDetailList = [
    {
      key: 'validUntil',
      accessor: () => '31.12.2024',
    },
    {
      key: 'emptyValue',
      accessor: () => '',
    },
    {
      key: 'hidden',
      accessor: () => 'hidden value',
      showIf: () => false,
    },
    {
      key: 'invisibleCell',
      accessor: () => 'ignored',
      invisible: true,
    },
  ];

  const renderSubject = (
    applicationOverride: Partial<Application> = {},
    itemComponent?: React.ComponentType<AlterationAccordionItemProps>
  ): ReturnType<typeof renderComponent> =>
    renderComponent(
      <DecisionSummary
        application={{
          ...baseApplication,
          ...applicationOverride,
        }}
        detailList={detailList}
        actions={<button type="button">Action button</button>}
        itemComponent={itemComponent}
        extraInformation={<div>Extra content</div>}
      />
    );

  it('returns null when AHJO automation is active but case id is missing', () => {
    const {
      renderResult: { container },
    } = renderSubject({
      status: APPLICATION_STATUSES.ACCEPTED,
      handledByAhjoAutomation: true,
      ahjoCaseId: undefined,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('renders summary details and opens decision link with transformed case id', async () => {
    const user = userEvent.setup();
    const openSpy = jest
      .spyOn(window, 'open')
      .mockImplementation(() => null);

    renderSubject();

    expect(screen.getByText('Päätöksen tiedot')).toBeInTheDocument();
    expect(screen.getByText(/HEL 2024-1/, { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByText('31.12.2024')).toBeInTheDocument();
    expect(screen.getByText('Extra content')).toBeInTheDocument();
    expect(screen.getByText('Action button')).toBeInTheDocument();

    await user.click(
      screen.getByRole('link', {
        name: 'Tarkastele päätöstä',
      })
    );

    expect(openSpy).toHaveBeenCalledWith(
      'https://paatokset.hel.fi/fi/asia/HEL-2024-1',
      '_blank'
    );

    openSpy.mockRestore();
  });

  it('renders alteration count and list sorted by end date', () => {
    renderSubject(
      {
        alterations: [
          {
            id: 2,
            application: 'application-id',
            endDate: '2024-06-10',
          },
          {
            id: 1,
            application: 'application-id',
            endDate: '2024-05-10',
          },
        ],
      },
      ItemComponent
    );

    expect(
      screen.getByText('2 ilmoitettua muutosta työsuhteessa')
    ).toBeInTheDocument();

    const items = screen.getAllByTestId('alteration-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('1-2024-05-10');
    expect(items[1]).toHaveTextContent('2-2024-06-10');
  });

  it('hides alterations section and AHJO actions for rejected applications', () => {
    renderSubject({
      status: APPLICATION_STATUSES.REJECTED,
      handledByAhjoAutomation: true,
      ahjoCaseId: undefined,
    });

    expect(
      screen.queryByText('Muutokset työsuhteessa')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Action button')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: 'Tarkastele päätöstä',
      })
    ).not.toBeInTheDocument();
  });

  it('renders empty alteration text when there are no alterations', () => {
    renderSubject({ alterations: [] }, ItemComponent);

    expect(
      screen.getByText(
        'Ei ilmoitettuja keskeytyksiä työsuhteessa. Työsuhde on toteutunut suunnitellusti.'
      )
    ).toBeInTheDocument();
  });

  it('renders empty alteration text when alterations are undefined', () => {
    renderSubject({ alterations: undefined }, ItemComponent);

    expect(
      screen.getByText(
        'Ei ilmoitettuja keskeytyksiä työsuhteessa. Työsuhde on toteutunut suunnitellusti.'
      )
    ).toBeInTheDocument();
  });
});