import { axe } from 'jest-axe';
import AlreadyActivatedPage from 'kesaseteli/youth/app/[locale]/already_activated/page';
import renderComponent from 'kesaseteli-shared/__tests__/utils/components/render-component';
import React from 'react';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/kesaseteli/youth/src/app/[locale]/already_activated/page.tsx', () => {
  it('should not violate accessibility', async () => {
    const {
      renderResult: { container },
    } = renderComponent(await AlreadyActivatedPage({ params: Promise.resolve({ locale: DEFAULT_LANGUAGE }) }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
