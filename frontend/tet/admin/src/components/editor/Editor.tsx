import React from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import ContactPerson from 'tet/admin/components/editor/contactPerson/ContactPerson';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';
import HiddenIdInput from 'tet/admin/components/editor/HiddenIdInput';
import Classification from 'tet/admin/components/editor/classification/Classification';
import { DevTool } from '@hookform/devtools';
import { tetPostingToEvent } from 'tet/admin/backend-api/transformations';

const initialValuesForNew: TetPosting = {
  title: '',
  description: '',
  location: '',
  spots: 3,
  contact_first_name: 'test',
  contact_last_name: '',
  contact_email: '',
  contact_phone: '',
  contact_language: 'fi',
  start_date: '',
  end_date: '',
  date_published: '',
  org_name: '',
  keywords_working_methods: [],
  keywords_attributes: [],
  keywords: [],
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
    reValidateMode: 'onChange',
    criteriaMode: 'all',
    defaultValues: initialValue || {
      contact_language: 'fi',
      keywords_working_methods: [],
      keywords_attributes: [],
      spots: 1,
    },
  });

  const upsertTetPosting = useUpsertTetPosting();

  const posting = initialValue || initialValuesForNew;

  const handleSuccess = (validatedPosting: TetPosting): void => {
    const event = tetPostingToEvent(validatedPosting);
    upsertTetPosting.mutate(event);
  };

  const submitHandler = async () => {
    const chosenWorkMethods = methods.getValues('keywords_working_methods');
    const validationResults = await methods.trigger();

    if (!chosenWorkMethods.length) {
      methods.setError('keywords_working_methods', {
        type: 'manual',
        message: 'Valitse yksi',
      });
    } else {
      methods.clearErrors('keywords_working_methods');
      if (validationResults) {
        methods.handleSubmit(handleSuccess)();
      }
    }
  };

  console.log(`Editing posting ${JSON.stringify(initialValue, null, 2)}`);

  return (
    <>
      <FormProvider {...methods}>
        <form aria-label="add/modify tet posting">
          <HiddenIdInput id="id" initialValue={posting.id} />
          <p>* pakollinen tieto</p>
          <EditorErrorNotification />
          <CompanyInfo />
          <ContactPerson initialValue={posting} />
          <PostingDetails initialValue={posting} />
          <Classification initialValue={posting} />
          <ActionButtons onSubmit={submitHandler} />
        </form>
      </FormProvider>
      <DevTool control={methods.control} />
    </>
  );
};

export default Editor;
