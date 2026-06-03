import { getEmploymentFieldPath } from './application-form.utils';

describe('getEmploymentFieldPath', () => {
  it('should return the correct field path', () => {
    expect(getEmploymentFieldPath(2, 'employee_name')).toBe(
      'summer_vouchers.2.employee_name'
    );
  });
});
