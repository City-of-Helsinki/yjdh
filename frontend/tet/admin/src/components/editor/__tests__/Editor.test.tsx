import React from 'react';
import renderComponent from 'tet/admin/__tests__/utils/components/render-component';
import Editor from 'tet/admin/components/editor/Editor';
import { fakeTetPosting } from 'tet-shared/__tests__/utils/fake-objects';
import getEditorApi from 'tet/admin/__tests__/utils/components/get-editor-api';

const posting = fakeTetPosting();

describe('frontend/tet/admin/src/components/editor/Editor', () => {
  it('should show field values in form components', async () => {
    //const editorApi = getEditorApi(posting);
    //renderComponent(<Editor initialValue={posting} />);
    //await editorApi.expectations.fieldValueIsPresent('org_name');
  });
});
