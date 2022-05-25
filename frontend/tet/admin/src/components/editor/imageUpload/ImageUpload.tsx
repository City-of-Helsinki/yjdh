import React from 'react';
import { Button, FileInput } from 'hds-react';
import useLocale from 'shared/hooks/useLocale';
import { useTranslation } from 'next-i18next';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';
import { $ImageContainer } from 'tet/admin/components/editor/imageUpload/ImageUpload.sc';
import { uploadImage } from 'tet/admin/components/editor/form/ActionButtons';

const ImageUpload = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    setValue,
    getValues,
    watch,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();
  const [file, setFile] = React.useState<File>(); // TODO needed?
  const [uploaded, setUploaded] = React.useState<boolean>(false);

  watch('image_url', 'image');

  const image_url = getValues('image_url') as string;
  const image = getValues('image');

  const onChange = (files: File[]) => {
    setFile(files[0]);
    setValue('image', files[0]); // setting this makes it possible to upload the image when saving the form
  };

  const upload = async () => {
    const uploadedImage = await uploadImage(file);
    console.log(uploadedImage);
    setValue('image_url', uploadedImage.url, { shouldDirty: true });
    setValue('image_id', uploadedImage['@id']);
    setUploaded(true);
  };

  console.log(image_url);

  const deleteImage = () => {
    setUploaded(false);
    setValue('image_url', '');
    // TODO also imageId needs to be reset
  };

  return (
    <FormSection>
      <$GridCell $colSpan={6}>
        {!image_url && (
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
            {image && <Button onClick={upload}>Tallenna kuva ilmoitukselle</Button>}
          </>
        )}
      </$GridCell>
      <$GridCell $colSpan={6}>
        {uploaded && <p>Kuva ladattu onnistuneesti ja tallentuu ilmoitukselle, kun tallennat ilmoituksen.</p>}
        {image && !uploaded && <p>Ilmoitukselle ollaan lisäämässä uusi kuva.</p>}
        <$ImageContainer>{image_url && <img src={image_url} width="100%" height="100%" />}</$ImageContainer>
        {image_url && <Button onClick={deleteImage}>Poista tai vaihda kuva</Button>}
      </$GridCell>
    </FormSection>
  );
};

export default ImageUpload;
