import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'shared/__tests__/utils/test-utils';

import AttachmentsIngress from '../AttachmentsIngress';

test('test for accessibility violations', async () => {
  const { container } = render(<AttachmentsIngress />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
