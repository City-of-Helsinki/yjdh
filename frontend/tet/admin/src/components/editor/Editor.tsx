import React from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';
import HiddenIdInput from 'tet/admin/components/editor/HiddenIdInput';

const initialValuesForNew: TetPosting = {
  title: '',
  description: '',
  spots: 3,
  start_date: '',
  end_date: '',
};

type EditorProps = {
  // eslint-disable-next-line react/require-default-props
  initialValue?: TetPosting;
};

export type EditorSectionProps = {
  initialValue: TetPosting;
};

// add new posting / edit existing
const Editor: React.FC<EditorProps> = ({ initialValue }) => {
  const methods = useForm<TetPosting>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const upsertTetPosting = useUpsertTetPosting();

  const posting = initialValue || initialValuesForNew;

  const handleSuccess = (validatedPosting: TetPosting): void => {
    const verb = validatedPosting.id ? 'PUT' : 'POST';
    console.log(`${verb} ${JSON.stringify(validatedPosting, null, 2)}`);
    upsertTetPosting.mutate(validatedPosting);
  };

  return (
    <FormProvider {...methods}>
      <form aria-label="add/modify tet posting" onSubmit={methods.handleSubmit(handleSuccess)}>
        <HiddenIdInput id="id" initialValue={posting.id} />
        <p>* pakollinen tieto</p>
        <EditorErrorNotification />
        <CompanyInfo />
        <PostingDetails initialValue={posting} />
        <ActionButtons />
      </form>
    </FormProvider>
  );
};

export default Editor;
