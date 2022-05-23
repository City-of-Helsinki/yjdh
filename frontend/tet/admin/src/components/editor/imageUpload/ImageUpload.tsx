import React from 'react';
import { FileInput } from 'hds-react';
import useLocale from 'shared/hooks/useLocale';
import { useTranslation } from 'next-i18next';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';

const ImageUpload = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    setValue,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();

  return (
    <FormSection>
      <$GridCell $colSpan={6}>
        <FileInput
          dragAndDrop
          label={t('common:editor.posting.imageUpload.label')}
          helperText={t('common:editor.posting.imageUpload.helperText')}
          id="file-input"
          maxSize={4000000}
          language={locale}
          accept=".png,.jpg"
          onChange={(files) => setValue('image', files[0])}
        />
      </$GridCell>
    </FormSection>
  );
};

export default ImageUpload;
