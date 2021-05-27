import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';

import Header from '../Header';

test('test for accessibility violations', async () => {
  const { container } = render(<Header />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
