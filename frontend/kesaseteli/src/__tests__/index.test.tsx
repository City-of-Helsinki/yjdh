import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';
import KesaseteliIndex from 'kesaseteli/pages/Index';

test('test for accessibility violations', async () => {
  const { container } = render(<KesaseteliIndex posts={[]} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
