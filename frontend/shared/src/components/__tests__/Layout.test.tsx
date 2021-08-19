import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'shared/__tests__/utils/test-utils';
import Layout from 'shared/components/Layout';

test('test for accessibility violations', async () => {
  const { container } = render(
    <Layout headingText="Hello"> ... world!</Layout>
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
