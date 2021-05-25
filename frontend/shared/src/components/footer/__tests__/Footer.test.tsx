import { axe } from 'jest-axe';
import React from 'react';
import Footer from '../Footer';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const { container } = render(<Footer />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
