import React, { useEffect, useContext, useState } from 'react';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import ContactPerson from 'tet/admin/components/editor/contactPerson/ContactPerson';
import { FormProvider, useForm } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import { useTranslation } from 'next-i18next';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import HiddenIdInput from 'tet/admin/components/editor/HiddenIdInput';
import Classification from 'tet/admin/components/editor/classification/Classification';
import { DevTool } from '@hookform/devtools';
import EmployerInfo from 'tet/admin/components/editor/employerInfo/EmployerInfo';
import ImageUpload from 'tet/admin/components/editor/imageUpload/ImageUpload';
import { initialPosting } from 'tet/admin/store/PreviewContext';
import useLeaveConfirm from 'shared/hooks/useLeaveConfirm';

type EditorProps = {
  // eslint-disable-next-line react/require-default-props
  initialValue?: TetPosting;
  isNewPosting?: boolean;
};

export type EditorSectionProps = {
  initialValue: TetPosting;
};

// add new posting / edit existing
const Editor: React.FC<EditorProps> = ({ initialValue, isNewPosting = false }) => {
  const { t } = useTranslation();
  const methods = useForm<TetPosting>({
    reValidateMode: 'onChange',
    mode: 'onBlur',
    criteriaMode: 'all',
    defaultValues: initialValue || initialPosting,
  });
  const message = t('common:editor.leaveConfirm');
  useLeaveConfirm(methods.formState.isDirty, message);

  return (
    <>
      <FormProvider {...methods}>
        <form aria-label={t('common:editor.formLabel')}>
          <HiddenIdInput id="id" initialValue={initialValue?.id} />
          <HiddenIdInput id="image_url" initialValue={initialValue?.image_url} />
          <HiddenIdInput id="image_id" initialValue={initialValue?.image_id} />
          <EditorErrorNotification />
          <p>* {t('common:editor.requiredInfo')}</p>
          <EmployerInfo />
          <CompanyInfo />
          <ImageUpload isNewPosting={isNewPosting} />
          <ContactPerson />
          <PostingDetails />
          <Classification />
          <ActionButtons />
        </form>
      </FormProvider>
      <DevTool control={methods.control} />
    </>
  );
};

export default Editor;
