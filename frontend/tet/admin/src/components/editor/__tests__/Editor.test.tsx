import React from 'react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import Editor from 'tet/admin/components/editor/Editor';
import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import getEditorApi from 'tet/admin/__tests__/utils/components/get-editor-api';
import {
  expectAttributesFromLinkedEvents,
  expectWorkingMethodsFromLinkedEvents,
  expectKeyWordsFromLinkedEvents,
} from 'tet/admin/__tests__/utils/backend/backend-nocks';
import { screen } from 'shared/__tests__/utils/test-utils';

const posting = fakeTetPosting({
  end_date: '12-12-2022',
  languages: [
    { label: 'Suomi', name: 'fi', value: 'fi' },
    { label: 'Ruotsi', name: 'sv', value: 'sv' },
  ],
  keywords: [{ label: 'Malmitalo', name: 'malmitalo', value: 'malmitalo' }],
});

describe('frontend/tet/admin/src/components/editor/Editor', () => {
  it('should show field values in form components', async () => {
    //expectKeyWordsFromLinkedEvents(posting.keywords[0]);
    renderComponent(<Editor initialValue={posting} />);
    const editorApi = getEditorApi(posting);
    //Location details
    await editorApi.expectations.inputValueIsPresent('title');
    //Contact details
    await editorApi.expectations.inputValueIsPresent('contact_first_name');
    await editorApi.expectations.inputValueIsPresent('contact_last_name');
    await editorApi.expectations.inputValueIsPresent('contact_email');
    await editorApi.expectations.inputValueIsPresent('contact_phone');
    //Posting details
    await editorApi.expectations.inputValueIsPresent('org_name');
    await editorApi.expectations.inputValueIsPresent('start_date');
    await editorApi.expectations.inputValueIsPresent('end_date');
    await editorApi.expectations.inputValueIsPresent('description');
    await editorApi.expectations.inputValueIsPresent('spots');
    await editorApi.expectations.languageValuesArePresent();
    //await editorApi.expectations.keywordsArePresent();
  });

  describe('when submiting form', () => {
    it(`shows errors if empty values on required fields`, async () => {
      expectWorkingMethodsFromLinkedEvents();
      expectAttributesFromLinkedEvents();
      renderComponent(<Editor />);
      const editorApi = getEditorApi(posting);
      await editorApi.actions.clickSendButton();
      //Location details
      await editorApi.expectations.textInputHasError('title');
      //Contact details
      await editorApi.expectations.textInputHasError('contact_first_name');
      await editorApi.expectations.textInputHasError('contact_last_name');
      await editorApi.expectations.textInputHasError('contact_email');
      await editorApi.expectations.textInputHasError('contact_phone');
      //Posting details
      await editorApi.expectations.textInputHasError('org_name');
      await editorApi.expectations.textInputHasError('start_date');
      await editorApi.expectations.dropdownHasError('TET-jaksolla käytetty kieli');
      await editorApi.expectations.textInputHasError('description');
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
