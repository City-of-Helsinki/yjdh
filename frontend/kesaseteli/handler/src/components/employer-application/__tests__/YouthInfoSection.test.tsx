import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import faker from 'faker';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import FakeObjectFactory from 'kesaseteli-shared/__tests__/utils/FakeObjectFactory';
import React from 'react';

import YouthInfoSection from '../YouthInfoFieldsSection';

describe('YouthInfoSection', () => {
  const fakeObjectFactory = new FakeObjectFactory();

  it('renders all employee fields', () => {
    const voucher = fakeObjectFactory.fakeHandlerSummerVoucher();
    renderComponent(<YouthInfoSection voucher={voucher} />);

    expect(screen.getByText(voucher.employee_name)).toBeInTheDocument();
    expect(screen.getByText(voucher.employee_school)).toBeInTheDocument();
    expect(screen.getByText(voucher.employee_phone_number)).toBeInTheDocument();
    expect(screen.getByText(voucher.employee_home_city)).toBeInTheDocument();
    expect(screen.getByText(voucher.employee_postcode)).toBeInTheDocument();
  });

  it('renders birthdate in Finnish locale format', () => {
    const voucher = fakeObjectFactory.fakeHandlerSummerVoucher({
      employee_birthdate: '2006-05-01',
    });
    renderComponent(<YouthInfoSection voucher={voucher} />);
    // employee_birthdate = '2006-05-01'
    expect(screen.getByText(/1\.5\.2006/)).toBeInTheDocument();
  });

  it('shows youth application link when youth_application_id is present', () => {
    const youthApplicationId = faker.datatype.uuid();
    const voucher = fakeObjectFactory.fakeHandlerSummerVoucher({
      youth_application_id: youthApplicationId,
    });
    renderComponent(<YouthInfoSection voucher={voucher} />);
    const link = screen.getByRole('link', { name: /avaa nuoren hakemus/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/youth-applications/${youthApplicationId}`);
  });

  it('hides youth application link when youth_application_id is empty', () => {
    const voucher = fakeObjectFactory.fakeHandlerSummerVoucher({
      youth_application_id: undefined,
    });
    renderComponent(<YouthInfoSection voucher={voucher} />);
    expect(
      screen.queryByRole('link', { name: /avaa nuoren hakemus/i })
    ).not.toBeInTheDocument();
  });

  it('renders info tooltip for youth section', async () => {
    const voucher = fakeObjectFactory.fakeHandlerSummerVoucher();
    renderComponent(<YouthInfoSection voucher={voucher} />);
    const tooltipBtn = screen.getByRole('button', { name: /näytä info/i });
    expect(tooltipBtn).toBeInTheDocument();

    await userEvent.click(tooltipBtn);
    expect(
      screen.getByText(/väestötietojärjestelmään \(vtj\)/i)
    ).toBeInTheDocument();
  });
});
