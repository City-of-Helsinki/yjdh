import { axe } from 'jest-axe';
import KesaseteliIndex from 'kesaseteli/pages/index';
import React from 'react';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const { container } = render(<KesaseteliIndex posts={[]} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
