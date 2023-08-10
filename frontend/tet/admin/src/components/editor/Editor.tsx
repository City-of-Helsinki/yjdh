import { useTranslation } from 'next-i18next';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import useLeaveConfirm from 'shared/hooks/useLeaveConfirm';
import Classification from 'tet/admin/components/editor/classification/Classification';
import CompanyInfo from 'tet/admin/components/editor/companyInfo/CompanyInfo';
import ContactPerson from 'tet/admin/components/editor/contactPerson/ContactPerson';
import EditorErrorNotification from 'tet/admin/components/editor/EditorErrorNotification';
import EmployerInfo from 'tet/admin/components/editor/employerInfo/EmployerInfo';
import ActionButtons from 'tet/admin/components/editor/form/ActionButtons';
import HiddenIdInput from 'tet/admin/components/editor/HiddenIdInput';
import ImageUpload from 'tet/admin/components/editor/imageUpload/ImageUpload';
import PostingDetails from 'tet/admin/components/editor/postingDetails/PostingDetails';
import { initialPosting } from 'tet/admin/store/PreviewContext';
import TetPosting from 'tet-shared/types/tetposting';

type EditorProps = {
  initialValue?: TetPosting;
  isNewPosting?: boolean;
};

export type EditorSectionProps = {
  initialValue: TetPosting;
};

// Known issue with react-hook-form library, errors out with:
// Type of property 'prototype' circularly references itself in mapped type '{ [K in keyof Blob]-?: PathImpl<K & string, Blob[K]>; }'.
// More at: https://github.com/orgs/react-hook-form/discussions/7764

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const RenderHiddenIdInput = (id: string, value: string): JSXElement => <HiddenIdInput id={id} initialValue={value} />;

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
    <FormProvider {...methods}>
      <form aria-label={t('common:editor.formLabel')}>
        {RenderHiddenIdInput('id', initialValue?.id)}
        {RenderHiddenIdInput('image_url', initialValue?.image_url)}
        {RenderHiddenIdInput('image_id', initialValue?.image_id)}
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
  );
};

export default Editor;
