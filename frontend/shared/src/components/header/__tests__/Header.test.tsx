import { axe } from 'jest-axe';
import React from 'react';
import Header from '../Header';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const { container } = render(<Header />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
