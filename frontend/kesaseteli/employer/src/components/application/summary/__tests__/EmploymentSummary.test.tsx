import { axe } from 'jest-axe';
import { expectToGetJobTypesFromBackend } from 'kesaseteli/employer/__tests__/utils/backend/backend-nocks';
import EmploymentSummary from 'kesaseteli/employer/components/application/summary/EmploymentSummary';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import FakeObjectFactory from 'kesaseteli-shared/__tests__/utils/FakeObjectFactory';
import React from 'react';
import { screen, waitFor } from 'shared/__tests__/utils/test-utils';

jest.mock('kesaseteli/employer/hooks/application/useApplicationApi');

const fakeObjectFactory = new FakeObjectFactory();

describe('frontend/kesaseteli/employer/src/components/application/summary/EmploymentSummary.tsx', () => {
  const mockApplication = fakeObjectFactory.fakeApplication();
  const mockEmployment = mockApplication.summer_vouchers[0];
  mockEmployment.job_type = 'sports_and_leisure';

  beforeEach(() => {
    (useApplicationApi as jest.Mock).mockImplementation(
      (options: { select?: (data: unknown) => unknown } = {}) => {
        let data: unknown = mockApplication;
        if (options.select) {
          data = options.select(data);
        }
        return {
          applicationQuery: {
            isSuccess: true,
            data,
          },
        };
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all employment fields correctly including job type', async () => {
    expectToGetJobTypesFromBackend();

    const {
      renderResult: { container },
    } = renderComponent(<EmploymentSummary index={0} />);

    // Wait for the query to finish and the component to render the data
    await waitFor(() => {
      expect(screen.getByTestId('job_type-0')).toHaveTextContent(
        'Liikunta ja vapaa-aika'
      );
    });

    // Check header
    expect(screen.getByTestId('employee-heading-0')).toHaveTextContent(
      mockEmployment.employee_name ?? ''
    );

    // Check basic fields
    expect(screen.getByTestId('employment_postcode-0')).toHaveTextContent(
      String(mockEmployment.employment_postcode)
    );
    expect(screen.getByTestId('employment_work_hours-0')).toHaveTextContent(
      String(mockEmployment.employment_work_hours)
    );
    expect(screen.getByTestId('employment_salary_paid-0')).toHaveTextContent(
      String(mockEmployment.employment_salary_paid)
    );

    if (mockEmployment.employment_description) {
      expect(screen.getByTestId('employment_description-0')).toHaveTextContent(
        mockEmployment.employment_description
      );
    }

    // Check accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
