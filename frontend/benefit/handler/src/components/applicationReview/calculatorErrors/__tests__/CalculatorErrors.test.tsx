import '@testing-library/jest-dom';

import { RenderResult, screen } from '@testing-library/react';
import renderComponent from 'benefit/handler/__tests__/utils/render-component';
import { ErrorData } from 'benefit/handler/types/common';
import React from 'react';

import CalculatorErrors from '../CalculatorErrors';

const renderSubject = (data: ErrorData | null | undefined): RenderResult =>
  renderComponent(<CalculatorErrors data={data} />).renderResult;

describe('CalculatorErrors', () => {
  it('renders nothing when data is null', () => {
    const { container } = renderSubject(null);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders calculator error title, message and calculation field errors', () => {
    const data = {
      calculation: {
        override_monthly_benefit_amount: 'Pakollinen kenttä',
        pay_subsidy_percent: 75,
      },
    } as unknown as ErrorData;

    renderSubject(data);

    expect(screen.getByText('Laskurissa on virheitä')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Ole hyvä ja tarkista laskelman tiedot ja yritä laskea uudestaan.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Helsinki-lisää € / kk: Pakollinen kenttä')
    ).toBeInTheDocument();
    expect(screen.getByText('Palkkatukiprosentti: 75')).toBeInTheDocument();
  });

  it('renders pay subsidy errors with row index suffix', () => {
    const data = {
      paySubsidies: [
        {
          monthly_pay: 'Virhe 1',
          state_aid_max_percentage: 80,
        },
        {
          monthly_pay: 'Virhe 2',
        },
      ],
    } as unknown as ErrorData;

    renderSubject(data);

    expect(screen.getByText('Palkkatuki')).toBeInTheDocument();
    expect(screen.getByText('Bruttopalkka * 1: Virhe 1')).toBeInTheDocument();
    expect(screen.getByText('Valtiotukimaksimi 1: 80')).toBeInTheDocument();
    expect(screen.getByText('Bruttopalkka * 2: Virhe 2')).toBeInTheDocument();
  });

  it('renders both paySubsidies and calculation sections when both are present', () => {
    const data = {
      paySubsidies: [{ monthly_pay: 'Puuttuu' }],
      calculation: {
        pay_subsidy_percent: 50,
      },
    } as unknown as ErrorData;

    renderSubject(data);

    expect(screen.getByText('Bruttopalkka * 1: Puuttuu')).toBeInTheDocument();
    expect(screen.getByText('Palkkatukiprosentti: 50')).toBeInTheDocument();
  });
});
