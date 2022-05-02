import React from 'react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import Editor from 'tet/admin/components/editor/Editor';
import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import getEditorApi from 'tet/admin/__tests__/utils/components/get-editor-api';
import {
  expectAttributesFromLinkedEvents,
  expectWorkingMethodsFromLinkedEvents,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import { screen } from 'shared/__tests__/utils/test-utils';

const posting = fakeTetPosting();

describe('frontend/tet/admin/src/components/editor/Editor', () => {
  it('should show field values in form components', async () => {
    renderComponent(<Editor initialValue={posting} />);
    const editorApi = getEditorApi(posting);
    await editorApi.expectations.fieldValueIsPresent('org_name');
    await editorApi.expectations.fieldValueIsPresent('title');
    await editorApi.expectations.fieldValueIsPresent('contact_first_name');
    await editorApi.expectations.fieldValueIsPresent('contact_last_name');
    await editorApi.expectations.fieldValueIsPresent('contact_email');
    await editorApi.expectations.fieldValueIsPresent('contact_phone');
  });

  describe('when submiting form', () => {
    it(`shows errors if empty values on required fields`, async () => {
      expectWorkingMethodsFromLinkedEvents();
      expectAttributesFromLinkedEvents();
      renderComponent(<Editor />);
      const editorApi = getEditorApi(posting);
      await editorApi.actions.clickSendButton();
      //await editorApi.expectations.selectionGroupHasError('Työtapa');
      await editorApi.expectations.textInputHasError('org_name');
      await editorApi.expectations.textInputHasError('title');
      await editorApi.expectations.textInputHasError('description');
      await editorApi.expectations.textInputHasError('contact_first_name');
      await editorApi.expectations.textInputHasError('contact_last_name');
      await editorApi.expectations.textInputHasError('contact_email');
      await editorApi.expectations.textInputHasError('contact_phone');
      await editorApi.expectations.textInputHasError('start_date');
      await editorApi.expectations.dropdownHasError('TET-jaksolla käytetty kieli');
    });

    it('shows error notification if form is not valid', async () => {
      expectWorkingMethodsFromLinkedEvents();
      expectAttributesFromLinkedEvents();
      renderComponent(<Editor />);
      const editorApi = getEditorApi(posting);
      await editorApi.actions.clickSendButton();
      await screen.findByRole('heading', {
        name: new RegExp('täytä puuttuvat tai virheelliset tiedot', 'i'),
      });
    });
  });
});
