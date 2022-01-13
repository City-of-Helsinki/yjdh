import React from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';

// add new posting / edit existing
const Editor: React.FC = () => {
  const methods = useForm<TetPosting>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const upsertTetPosting = useUpsertTetPosting();

  const handleSuccess = (validatedPosting: TetPosting): void => {
    const verb = validatedPosting.id ? 'PUT' : 'POST';
    console.log(`${verb} ${JSON.stringify(validatedPosting, null, 2)}`);
    upsertTetPosting.mutate(validatedPosting);
  };

  return (
    <FormProvider {...methods}>
      <form aria-label="add/modify tet posting" onSubmit={methods.handleSubmit(handleSuccess)}>
        <p>* pakollinen tieto</p>
        <EditorErrorNotification />
        <CompanyInfo />
        <PostingDetails />
        <ActionButtons />
      </form>
    </FormProvider>
  );
};

export default Editor;
