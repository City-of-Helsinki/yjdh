import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { buildAcceptedBenefitRows } from 'benefit/handler/__tests__/utils/calculation-row-factory';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { setupUserAndRender } from 'benefit/handler/__tests__/utils/user-render-helper';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Row } from 'benefit-shared/types/application';
import React from 'react';

import DoneModalContent from '../DoneModalContent';

const onClose = jest.fn();
const onSubmit = jest.fn();

const buildCalculationRows = (): Row[] => [
  ...buildAcceptedBenefitRows({
    includeDateRange: true,
    monthlyDescriptionFi: 'Kuukausi 1',
    monthlyAmount: '500',
    totalDescriptionFi: 'Yhteensä ajalta',
    totalRowDescriptionFi: 'Helsinki-lisä yhteensä',
    totalRowAmount: '900',
  }),
];

const buildHandledApplication = (
  overrides: Partial<HandledAplication> = {}
): HandledAplication => ({
  status: APPLICATION_STATUSES.ACCEPTED,
  logEntryComment: 'Perustelun teksti',
  ...overrides,
});

type RenderOptions = {
  handledApplication?: HandledAplication | null;
  calculationRows?: Row[];
};

const renderSubject = ({
  handledApplication = buildHandledApplication(),
  calculationRows = buildCalculationRows(),
}: RenderOptions = {}): ReturnType<typeof renderComponent> =>
  renderComponent(
    <DoneModalContent
      handledApplication={handledApplication}
      onClose={onClose}
      onSubmit={onSubmit}
      calculationRows={calculationRows}
    />
  );

const getSubmitButton = (): HTMLElement => screen.getByTestId('submit');
const getCloseButton = (): HTMLElement => screen.getByTestId('close');

describe('DoneModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders accepted state with subsidy summary and description', () => {
    renderSubject();

    expect(
      screen.getByText(
        'Olet siirtämässä hakemuksen päätösjonoon, jossa sille tehdään myönteinen päätös'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Myönnettävä tuki')).toBeInTheDocument();
    expect(screen.getByText('900 € euroa yhteensä')).toBeInTheDocument();
    expect(screen.getByText(/500 € euroa kuukaudessa/)).toBeInTheDocument();
    expect(screen.getByText('Perustelu')).toBeInTheDocument();
    expect(screen.getByText('Perustelun teksti')).toBeInTheDocument();
    expect(getSubmitButton()).toHaveTextContent('Tee myönteinen päätösehdotus');
    expect(getCloseButton()).toHaveTextContent('Peruuta');
  });

  it('renders rejecting state without accepted subsidy section', () => {
    renderSubject({
      handledApplication: buildHandledApplication({
        status: APPLICATION_STATUSES.REJECTED,
        logEntryComment: undefined,
      }),
    });

    expect(
      screen.getByText(
        'Olet siirtämässä hakemuksen päätösjonoon, jossa sille tehdään kielteinen päätös'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Myönnettävä tuki')).not.toBeInTheDocument();
    expect(screen.queryByText('Perustelu')).not.toBeInTheDocument();
    expect(getSubmitButton()).toHaveTextContent('Tee kielteinen päätösehdotus');
  });

  it('does not render subsidy summary when accepted but total row is missing', () => {
    renderSubject({
      calculationRows: [],
    });

    expect(screen.queryByText('Myönnettävä tuki')).not.toBeInTheDocument();
  });

  it('calls submit and close handlers from action buttons', async () => {
    const user = setupUserAndRender(() => renderSubject());

    await user.click(getSubmitButton());
    await user.click(getCloseButton());

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
