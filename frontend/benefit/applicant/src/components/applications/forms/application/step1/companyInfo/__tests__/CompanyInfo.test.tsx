import { RenderResult } from '@testing-library/react';
import renderComponent from 'benefit/applicant/utils/test-utils/render-component';
import faker from 'faker';
import { axe } from 'jest-axe';
import React from 'react';

import CompanyInfo, { CompanyInfoProps } from '../CompanyInfo.component';

describe('CompanyInfo', () => {
  const data = {
    name: faker.company.companyName(),
    city: faker.address.city(),
    postcode: faker.address.zipCode(),
    streetAddress: faker.address.streetAddress(),
    businessId: faker.datatype.uuid(),
  };

  const initialProps: CompanyInfoProps = { data };

  const getComponent = (props: Partial<CompanyInfoProps> = {}): RenderResult =>
    renderComponent(<CompanyInfo {...initialProps} {...props} />);

  it('should render with no accessibility violations', async () => {
    const { container } = getComponent();
    const results = await axe(container);

    expect(results).toHaveNoViolations();
  });
});
