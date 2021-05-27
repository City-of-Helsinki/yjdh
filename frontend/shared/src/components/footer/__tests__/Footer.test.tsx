import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';

import Footer from '../Footer';

test('test for accessibility violations', async () => {
  const { container } = render(<Footer />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
