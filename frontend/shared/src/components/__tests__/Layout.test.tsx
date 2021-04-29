import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';
import Layout from 'shared/components/Layout';

test('test for accessibility violations', async () => {
  const { container } = render(<Layout>Hello World</Layout>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
