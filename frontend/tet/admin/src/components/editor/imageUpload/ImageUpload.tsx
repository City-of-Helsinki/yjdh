import { AxiosError } from 'axios';
import { Button, FileInput, IconTrash, LoadingSpinner } from 'hds-react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useConfirm from 'shared/hooks/useConfirm';
import useLocale from 'shared/hooks/useLocale';
import { deleteImage, uploadImage } from 'tet/admin/backend-api/backend-api';
import {
  $ButtonContainer,
  $ImageContainer,
  $PhotographerField,
  $SpinnerWrapper,
} from 'tet/admin/components/editor/imageUpload/ImageUpload.sc';
import TextInput from 'tet/admin/components/editor/TextInput';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';
import useValidationRules from 'tet/admin/hooks/translation/useValidationRules';
import TetPosting from 'tet-shared/types/tetposting';

type Props = {
  isNewPosting: boolean;
};

const ImageUpload: React.FC<Props> = ({ isNewPosting }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { confirm } = useConfirm();
  const { notRequiredName } = useValidationRules();
  const { setValue, getValues, watch } = useFormContext<TetPosting>();
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const handleUploadError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.saveErrorTitle'),
    errorMessage: t('common:api.saveErrorTitle'),
  });

  watch('image_url', 'image');

  const image_url = getValues('image_url');
  const photographer_name = getValues('photographer_name');

  const onChange = async (files: File[]): Promise<void> => {
    setValue('image', files[0]); // setting this makes it possible to upload the image when saving the form
    setIsUploading(true);
    try {
      const uploadedImage = await uploadImage(files[0], photographer_name);
      setValue('image_url', uploadedImage.url, { shouldDirty: true });
      setValue('image_id', uploadedImage['@id']);
      setIsUploading(false);
    } catch (error) {
      handleUploadError(error as AxiosError);
      setIsUploading(false);
    }
  };

  const clearImageData = (): void => {
    setValue('image_url', '');
    setValue('image_id', '');
    setValue('image', null);
    setValue('photographer_name', '');
  };

  const removeImage = async (): Promise<void> => {
    if (isNewPosting) {
      clearImageData();
    } else {
      const isConfirmed = await confirm({
        header: t('common:editor.posting.imageUpload.deleteConfirmTitle'),
        content: t('common:editor.posting.imageUpload.deleteConfirmContent'),
        submitButtonLabel: t('common:editor.posting.imageUpload.deleteButton'),
        submitButtonVariant: 'danger',
      });

      if (isConfirmed) {
        setIsUploading(true);
        try {
          const id = getValues('id');
          await deleteImage(id);
          clearImageData();
        } catch (error) {
          handleUploadError(error as AxiosError);
        }

        setIsUploading(false);
      }
    }
  };

  return (
    <FormSection>
      <$GridCell $colSpan={6}>
        {isUploading ? (
          <$SpinnerWrapper>
            <LoadingSpinner />
          </$SpinnerWrapper>
        ) : !image_url ? (
          <FileInput
            dragAndDrop
            label={t('common:editor.posting.imageUpload.label')}
            helperText={t('common:editor.posting.imageUpload.helperText')}
            id="file-input"
            maxSize={4_000_000}
            language={locale}
            accept=".png,.jpg"
            onChange={onChange}
          />
        ) : (
          <>
            <$ImageContainer>{image_url && <Image src={image_url} width="100%" height="100%" />}</$ImageContainer>
            {image_url && (
              <$ButtonContainer>
                <Button variant="danger" iconLeft={<IconTrash />} onClick={removeImage}>
                  {t('common:editor.posting.imageUpload.deleteImage')}
                </Button>
              </$ButtonContainer>
            )}
            <$PhotographerField>
              <TextInput
                id="photographer_name"
                label={t('common:editor.posting.imageUpload.photographerName')}
                placeholder={t('common:editor.posting.imageUpload.photographerName')}
                helperText={t('common:editor.posting.imageUpload.photographerNameHelperText')}
                registerOptions={notRequiredName}
              />
            </$PhotographerField>
          </>
        )}
      </$GridCell>
    </FormSection>
  );
};

export default ImageUpload;
