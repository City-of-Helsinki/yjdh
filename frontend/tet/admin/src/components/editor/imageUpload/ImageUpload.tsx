import React from 'react';
import { Button, FileInput, LoadingSpinner } from 'hds-react';
import useLocale from 'shared/hooks/useLocale';
import { useTranslation } from 'next-i18next';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import {
  $ImageContainer,
  $ButtonContainer,
  $SpinnerWrapper,
} from 'tet/admin/components/editor/imageUpload/ImageUpload.sc';
import { uploadImage } from 'tet/admin/backend-api/backend-api';
import useLinkedEventsErrorHandler from 'tet/admin/hooks/backend/useLinkedEventsErrorHandler';
import useConfirm from 'shared/hooks/useConfirm';

const ImageUpload = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { confirm } = useConfirm();
  const {
    setValue,
    getValues,
    watch,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();
  const [file, setFile] = React.useState<File>(); // TODO needed?
  const [uploaded, setUploaded] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const handleUploadError = useLinkedEventsErrorHandler({
    errorTitle: t('common:api.saveErrorTitle'),
    errorMessage: t('common:api.saveErrorTitle'),
  });

  watch('image_url', 'image');

  const image_url = getValues('image_url') as string;
  const image = getValues('image');

  const onChange = async (files: File[]) => {
    setFile(files[0]);
    setValue('image', files[0]); // setting this makes it possible to upload the image when saving the form
    setIsUploading(true);
    try {
      const uploadedImage = await uploadImage(file, 'Testi Kuvaaja');
      console.log(uploadedImage);
      setValue('image_url', uploadedImage.url, { shouldDirty: true });
      setValue('image_id', uploadedImage['@id']);
      setIsUploading(false);
      setUploaded(true);
    } catch (err) {
      handleUploadError(err);
      setIsUploading(false);
    }
  };

  const deleteImage = async () => {
    const isConfirmed = await confirm({
      header: t('common:editor.posting.imageUpload.deleteConfirmTitle'),
      content: t('common:editor.posting.imageUpload.deleteConfirmContent'),
      submitButtonLabel: t('common:editor.posting.imageUpload.deleteButton'),
      submitButtonVariant: 'danger',
    });

    if (isConfirmed) {
      setUploaded(false);
      setValue('image_url', '');
      setValue('image_id', '');
      setValue('image', null);
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
          <>
            <FileInput
              dragAndDrop
              label={t('common:editor.posting.imageUpload.label')}
              helperText={t('common:editor.posting.imageUpload.helperText')}
              id="file-input"
              maxSize={4000000}
              language={locale}
              accept=".png,.jpg"
              onChange={onChange}
            />
          </>
        ) : (
          <>
            <$ImageContainer>{image_url && <img src={image_url} width="100%" height="100%" />}</$ImageContainer>
            {image_url && (
              <$ButtonContainer>
                <Button onClick={deleteImage}>{t('common:editor.posting.imageUpload.deleteImage')}</Button>
              </$ButtonContainer>
            )}
          </>
        )}
      </$GridCell>
    </FormSection>
  );
};

export default ImageUpload;
