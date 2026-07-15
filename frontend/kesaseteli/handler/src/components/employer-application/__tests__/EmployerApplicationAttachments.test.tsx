import { screen } from '@testing-library/react';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';

import FakeObjectFactory from 'shared/__tests__/utils/FakeObjectFactory';

import EmployerApplicationAttachments from '../EmployerApplicationAttachments';
import { mockApplicationSingleVoucher, mockVoucher1 } from '../fixtures';

describe('EmployerApplicationAttachments', () => {
  const fakeObjectFactory = new FakeObjectFactory();

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('renders "no attachments" placeholder when empty', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              attachments: [],
            },
          ],
        }}
      />
    );
    expect(screen.getByText(/ei liitteitä/i)).toBeInTheDocument();
  });

  it('renders voucher attachments when present', () => {
    renderComponent(
      <EmployerApplicationAttachments
        application={{
          ...mockApplicationSingleVoucher,
          summer_vouchers: [
            {
              ...mockVoucher1,
              attachments: [
                {
                  ...fakeObjectFactory.fakeAttachment('employment_contract'),
                  id: 'attachment-1',
                  attachment_file_name: 'sopimus.pdf',
                },
                {
                  ...fakeObjectFactory.fakeAttachment('payslip'),
                  id: 'attachment-2',
                  attachment_file_name: 'palkkakuitti.pdf',
                },
              ],
            },
          ],
        }}
      />
    );
    expect(screen.getByText('sopimus.pdf')).toBeInTheDocument();
    expect(screen.getByText('palkkakuitti.pdf')).toBeInTheDocument();
  });
});
