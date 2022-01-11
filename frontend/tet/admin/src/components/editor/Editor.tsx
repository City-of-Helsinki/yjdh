import React from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';

// add new posting / edit existing
const Editor: React.FC = () => {
  const methods = useForm<TetPosting>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  return (
    <FormProvider {...methods}>
      <form aria-label="add/modify tet posting">
        <p>* pakollinen tieto</p>
        <CompanyInfo />
        <PostingDetails />
        <ActionButtons />
      </form>
    </FormProvider>
  );
};

export default Editor;
