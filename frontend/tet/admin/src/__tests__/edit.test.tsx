import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import EditStaticPage from 'tet/admin/pages';
import { axe } from 'jest-axe';
import React from 'react';
import { expectUnauthorizedReply } from 'tet/admin/__tests__/utils/backend/backend-nocks';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';

describe('frontend/tet/admin/src/pages/editstatic.tsx', () => {
  it('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<EditStaticPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    await renderPage(EditStaticPage, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`));
  });
});
