import { screen } from '@testing-library/react';
import {
  buildAcceptedBenefitRows,
  createCalculatorRow,
} from 'benefit/handler/__tests__/utils/calculation-row-factory';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { CALCULATION_ROW_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import React from 'react';

import DecisionCalculationAccordion from '../DecisionCalculationAccordion';

jest.mock('../InstalmentAccordionSections', () => {
  const ReactM = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: ({ data }: { data: Application }) =>
      ReactM.createElement(
        'div',
        {
          'data-testid': 'instalment-accordion-sections',
        },
        data.id
      ),
  };
});

jest.mock('../PaidSalariesAccordion', () => {
  const ReactM = jest.requireActual<typeof import('react')>('react');
  return {
    __esModule: true,
    default: ({ data }: { data: Application }) =>
      ReactM.createElement(
        'div',
        {
          'data-testid': 'paid-salaries-accordion',
        },
        data.id
      ),
  };
});

const buildCalculationRows = ({
  totalDescriptionFi = 'Total description',
  totalRowAmount = '999',
  totalRowDescriptionFi = 'Total row',
}: {
  totalDescriptionFi?: string;
  totalRowAmount?: string;
  totalRowDescriptionFi?: string;
} = {}): ReturnType<typeof createCalculatorRow>[] => [
  ...buildAcceptedBenefitRows({
    monthlyDescriptionFi: 'Monthly benefit',
    monthlyAmount: '123',
    totalDescriptionFi,
    totalRowDescriptionFi,
    totalRowAmount,
  }),
];

const buildApplication = (
  rows: ReturnType<typeof createCalculatorRow>[]
): Application =>
  ({
    id: 'application-1',
    calculation: {
      rows,
    },
  } as unknown as Application);

describe('DecisionCalculationAccordion', () => {
  const data = buildApplication([]);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSubject = (application: Application = data): void => {
    renderComponent(<DecisionCalculationAccordion data={application} />);
  };

  it('renders all accordion sections and child components', () => {
    renderSubject();

    expect(screen.getByText('Laskelma')).toBeInTheDocument();
    expect(screen.getByText('Maksetut tuet')).toBeInTheDocument();
    expect(screen.getByText('Maksetut palkat')).toBeInTheDocument();

    expect(
      screen.getByTestId('instalment-accordion-sections')
    ).toHaveTextContent('application-1');
    expect(screen.getByTestId('paid-salaries-accordion')).toHaveTextContent(
      'application-1'
    );
  });

  it('renders total highlight using total row description when available', () => {
    renderSubject(
      buildApplication(
        buildCalculationRows({
          totalDescriptionFi: 'Selected total description',
          totalRowAmount: '900',
          totalRowDescriptionFi: 'Fallback total description',
        })
      )
    );

    expect(screen.getByTestId('calculation-results-total')).toHaveTextContent(
      'Selected total description'
    );
    expect(screen.getByTestId('calculation-results-total')).toHaveTextContent(
      '900 €'
    );
    expect(
      screen.getAllByText('Myönnettävä Helsinki-lisä').length
    ).toBeGreaterThan(0);
  });

  it('renders monthly calculation row with accepted benefit label and per-month suffix', () => {
    renderSubject(buildApplication(buildCalculationRows()));

    expect(
      screen.getAllByText('Myönnettävä Helsinki-lisä').length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Monthly benefit')).toBeInTheDocument();
    expect(screen.getByText('123 €/kk')).toBeInTheDocument();
  });

  it('falls back to total row description when total row description is missing', () => {
    const totalRow = createCalculatorRow({
      id: 'total-row',
      rowType: CALCULATION_ROW_TYPES.HELSINKI_BENEFIT_TOTAL_EUR,
      descriptionFi: 'Fallback total description',
      amount: '1100',
    });

    renderSubject(buildApplication([totalRow]));

    expect(screen.getByTestId('calculation-results-total')).toHaveTextContent(
      'Fallback total description'
    );
    expect(screen.getByTestId('calculation-results-total')).toHaveTextContent(
      '1 100 €'
    );
  });
});
