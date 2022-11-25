import { axe } from 'jest-axe';
import React from 'react';
import { waitForBackendRequestsToComplete } from 'shared/__tests__/utils/component.utils';
import { waitFor } from 'shared/__tests__/utils/test-utils';
import { DEFAULT_LANGUAGE } from 'shared/i18n/i18n';
import {
  expectAttributesFromLinkedEvents,
  expectAuthorizedReply,
  expectToGetSingleEventFromBackend,
  expectUnauthorizedReply,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import getFormPageApi from 'tet/admin/__tests__/utils/components/get-form-page-api';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import renderPage from 'tet/admin/__tests__/utils/components/render-page';
import getTetAdminTranslationsApi from 'tet/admin/__tests__/utils/i18n/get-tet-admin-translations-api';
import EditStaticPage from 'tet/admin/pages/editstatic';
import { fakeTetEvent } from 'tet-shared/__tests__/utils/fake-objects';

const {
  translations: { [DEFAULT_LANGUAGE]: translations },
} = getTetAdminTranslationsApi();

const event = fakeTetEvent({
  id: '22',
});

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
    renderPage(EditStaticPage, { push: spyPush });
    await waitFor(() => expect(spyPush).toHaveBeenCalledWith(`${DEFAULT_LANGUAGE}/login`));
  });

  // this test occasionally fails
  // TODO find out why and enable
  it.skip('should render page', async () => {
    expectAuthorizedReply();
    expectWorkingMethodsFromLinkedEvents();
    expectAttributesFromLinkedEvents();
    expectToGetSingleEventFromBackend(event);

    const spyPush = jest.fn();
    renderPage(EditStaticPage, { push: spyPush, query: { id: event.id } });

    await waitForBackendRequestsToComplete();

    const formApi = getFormPageApi();
    await formApi.expectations.pageIsLoaded(translations.editor.editTitle);
  });
});
