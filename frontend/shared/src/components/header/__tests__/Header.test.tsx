import { axe } from 'jest-axe';
import React from 'react';
import { render } from 'test-utils';

import Header from '../Header';

// "svg elements with an img role have an alternative text (svg-img-alt)"
test.skip('test for accessibility violations', async () => {
  const { container } = render(
    <Header
      title="Title"
      locale="fi"
      languages={[{ label: 'Fi', value: 'fi' }]}
      onLanguageChange={() => null}
      onTitleClick={() => null}
      onNavigationItemClick={() => null}
      menuToggleAriaLabel="menu"
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
