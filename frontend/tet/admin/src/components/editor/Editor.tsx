import React, { useEffect, useContext } from 'react';
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
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import { tetPostingToEvent } from 'tet/admin/backend-api/transformations';

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

  const { tetData } = useContext(PreviewContext);

  useEffect(() => {
    methods.reset({
      contact_first_name: tetData.contact_first_name,
      contact_last_name: tetData.contact_last_name,
      contact_phone: tetData.contact_phone,
      contact_email: tetData.contact_email,
      org_name: tetData.org_name,
      title: tetData.title,
      spots: tetData.spots,
      description: tetData.description,
      start_date: tetData.start_date,
      end_date: tetData.end_date,
      keywords_working_methods: [],
      keywords_attributes: [],
    });
  }, [tetData, methods.reset]);

  const upsertTetPosting = useUpsertTetPosting();

  const handleSuccess = (validatedPosting: TetPosting): void => {
    const event = tetPostingToEvent(validatedPosting);
    upsertTetPosting.mutate({
      id: validatedPosting.id,
      event,
    });
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
        void methods.handleSubmit(handleSuccess)();
      }
    }
  };

  console.log(`Editing posting ${JSON.stringify(initialValue, null, 2)}`);

  return (
    <>
      <FormProvider {...methods}>
        <form aria-label="add/modify tet posting">
          <HiddenIdInput id="id" initialValue={initialValue?.id} />
          <p>* pakollinen tieto</p>
          <EditorErrorNotification />
          <CompanyInfo />
          <ContactPerson />
          <PostingDetails />
          <Classification />
          <ActionButtons onSubmit={submitHandler} />
        </form>
      </FormProvider>
      <DevTool control={methods.control} />
    </>
  );
};

export default Editor;
