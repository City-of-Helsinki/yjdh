import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import { fakeActivatedYouthApplication } from 'kesaseteli-shared/__tests__/utils/fake-objects';
import React from 'react';

import VtjRawData from '../VtjRawData';

describe('VtjRawData', () => {
  it('renders accordion and displays non-omitted raw JSON data', () => {
    const application = fakeActivatedYouthApplication({
      encrypted_handler_vtj_json: {
        Henkilo: {
          NykyinenSukunimi: { Sukunimi: 'Testinen' },
          Henkilotunnus: {
            '@voimassaolokoodi': '1',
            '#text': '010101-123A',
          },
        },
      },
    });

    renderComponent(
      <VtjRawData data={application.encrypted_handler_vtj_json} />
    );

    // Verify accordion header button
    expect(
      screen.getByRole('button', { name: /näytä kaikki raakadata/i })
    ).toBeInTheDocument();

    // Verify raw JSON stringified contents
    const preElement = screen.getByText(
      (content, element) =>
        element?.tagName.toLowerCase() === 'pre' && content.includes('Testinen')
    );
    expect(preElement).toBeInTheDocument();
    expect(preElement).toHaveTextContent(/010101-123A/);

    // Ensure keys starting with '@' are omitted
    expect(preElement).not.toHaveTextContent(/@voimassaolokoodi/);
    expect(preElement).toHaveTextContent(/#text/);
  });
});
