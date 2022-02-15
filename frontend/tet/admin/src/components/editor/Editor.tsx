import React, { useEffect, useContext, useState } from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import ContactPerson from 'tet/admin/components/editor/contactPerson/ContactPerson';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import { useTranslation } from 'next-i18next';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';
import HiddenIdInput from 'tet/admin/components/editor/HiddenIdInput';
import Classification from 'tet/admin/components/editor/classification/Classification';
import { DevTool } from '@hookform/devtools';
import { tetPostingToEvent } from 'tet-shared/backend-api/transformations';
import EmployerInfo from 'tet/admin/components/editor/employerInfo/EmployerInfo';
import { initialPosting } from 'tet/admin/store/PreviewContext';

type EditorProps = {
  // eslint-disable-next-line react/require-default-props
  initialValue?: TetPosting;
  allowDelete?: boolean;
  allowPublish?: boolean;
};

export type EditorSectionProps = {
  initialValue: TetPosting;
};

// add new posting / edit existing
const Editor: React.FC<EditorProps> = ({ initialValue, allowDelete = true, allowPublish = false }) => {
  const { t } = useTranslation();
  const methods = useForm<TetPosting>({
    reValidateMode: 'onChange',
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: initialValue || initialPosting,
  });

  const upsertTetPosting = useUpsertTetPosting();

  const handleSuccess = (validatedPosting: TetPosting): void => {
    const event = tetPostingToEvent(validatedPosting);
    upsertTetPosting.mutate({
      id: validatedPosting.id,
      event,
    });
  };

  return (
    <>
      <FormProvider {...methods}>
        <form aria-label="add/modify tet posting">
          <HiddenIdInput id="id" initialValue={initialValue?.id} />
          <EditorErrorNotification />
          <p>* {t('common:editor.requiredInfo')}</p>
          <EmployerInfo />
          <CompanyInfo />
          <ContactPerson />
          <PostingDetails />
          <Classification />
          <ActionButtons
            onSubmit={methods.handleSubmit(handleSuccess)}
            allowDelete={allowDelete}
            allowPublish={allowPublish}
          />
        </form>
      </FormProvider>
      <DevTool control={methods.control} />
    </>
  );
};

export default Editor;
