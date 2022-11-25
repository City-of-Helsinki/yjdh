import { axe } from 'jest-axe';
import React from 'react';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import { expectUnauthorizedReply } from 'tet/admin/__tests__/utils/backend/backend-nocks';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import CopyStaticPage from 'tet/admin/pages/copystatic';

describe('frontend/tet/admin/src/pages/copystatic.tsx', () => {
  it('should have no accessibility violations', async () => {
    const {
      renderResult: { container },
    } = renderComponent(<CopyStaticPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should redirect when unauthorized', async () => {
    expectUnauthorizedReply();
    const spyPush = jest.fn();
    renderPage(CopyStaticPage, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`));
  });
});
