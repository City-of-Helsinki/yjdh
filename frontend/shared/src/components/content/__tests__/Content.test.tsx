import { axe } from 'jest-axe';
import React from 'react';
import Content from '../Content';
import { render } from 'test-utils';

test('test for accessibility violations', async () => {
  const { container } = render(<Content>content</Content>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
