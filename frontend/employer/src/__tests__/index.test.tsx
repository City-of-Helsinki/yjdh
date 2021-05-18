import EmployerIndex from 'employer/pages/index';
import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const { container } = render(<EmployerIndex />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
