import { Button, IconCross, IconEye, IconUpload, IconSaveDiskette } from 'hds-react';
import cloneDeep from 'lodash/cloneDeep';
import { useTranslation } from 'next-i18next';
import React, { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import useConfirm from 'shared/hooks/useConfirm';
import { useTheme } from 'styled-components';
import useDeleteTetPosting from 'tet/admin/hooks/backend/useDeleteTetPosting';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import TetPosting from 'tet-shared/types/tetposting';
import { tetPostingToEvent } from 'tet-shared/backend-api/transformations';
import useUpsertTetPosting from 'tet/admin/hooks/backend/useUpsertTetPosting';
import { ImageObject } from 'tet-shared/types/linkedevents';

// TODO When TETP-222 is implemented, we can replace this with an API call to backend,
// which returns a URL representing the image object.
export const uploadImage = async (image?: File): Promise<ImageObject> => {
  await new Promise((r) => setTimeout(r, 2000));
  return {
    url: 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/media/images/testimage_9gcuSik.png',
    '@id': 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1/image/4234/',
  };
};

const ActionButtons: React.FC = () => {
  const { setPreviewVisibility, setTetPostingData, setFormValid } = useContext(PreviewContext);
  const deleteTetPosting = useDeleteTetPosting();
  const upsertTetPosting = useUpsertTetPosting();
  const { confirm } = useConfirm();

  const { t } = useTranslation();
  const {
    getValues,
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();
  const theme = useTheme();
  const posting = getValues();

  const allowPublish = posting.date_published === null;
  const allowDelete = !!posting.id;

  const showPreview = async () => {
    const isValid = await trigger();
    const values = getValues();
    setTetPostingData(cloneDeep(values));
    setFormValid(isValid);
    setPreviewVisibility(true);
  };

  const deletePostingHandler = async () => {
    await showDeleteConfirm();
  };

  const showDeleteConfirm = async () => {
    const isConfirmed = await confirm({
      header: t('common:delete.confirmation', { posting: posting.title }),
      submitButtonLabel: t('common:delete.deletePosting'),
    });

    if (isConfirmed) {
      deleteTetPosting.mutate(posting);
    }
  };

  const saveHandler = async (validatedPosting: TetPosting): void => {
    console.log(validatedPosting);
    // Upload image if user has selected a new image
    // const imageId = validatedPosting.image ? await uploadImage(validatedPosting.image)['@id'] : undefined;

    const event = tetPostingToEvent({
      posting: validatedPosting,
      // imageId,
    });
    console.log(event);
    upsertTetPosting.mutate({
      id: validatedPosting.id,
      event,
    });
  };

  const publishPostingHandler = async (validatedPosting: TetPosting): Promise<void> => {
    const isConfirmed = await confirm({
      header: t('common:publish.confirmation', { posting: posting.title }),
      content: t('common:application.publishTerms'),
      linkText: t('common:application.termsLink'),
      link: '/TET-alusta-kayttoehdot.pdf',
      submitButtonLabel: t('common:publish.publishPosting'),
    });

    if (isConfirmed) {
      const event = tetPostingToEvent({
        posting: validatedPosting,
        publish: true,
      });

      upsertTetPosting.mutate({
        id: validatedPosting.id,
        event,
      });
    }
  };

  return (
    <FormSection withoutDivider>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={3}>
          <Button
            onClick={handleSubmit(saveHandler)}
            disabled={isSubmitting}
            iconLeft={<IconSaveDiskette />}
            css={`
              background-color: transparent;
              color: ${theme.colors.black90};
              border: ${theme.colors.black90} !important;
            `}
          >
            {allowPublish ? t('common:editor.saveDraft') : t('common:editor.savePublished')}
          </Button>
        </$GridCell>
        {allowDelete ? (
          <$GridCell $colSpan={3}>
            <Button
              variant="supplementary"
              iconLeft={<IconCross />}
              disabled={isSubmitting}
              onClick={deletePostingHandler}
              css={`
                background-color: transparent;
                color: ${theme.colors.black90};
              `}
            >
              {t('common:editor.deletePosting')}
            </Button>
          </$GridCell>
        ) : (
          <$GridCell $colSpan={3}>{null}</$GridCell>
        )}
        <$GridCell $colSpan={3}>
          <Button disabled={isSubmitting} iconLeft={<IconEye />} onClick={showPreview}>
            {t('common:editor.preview')}
          </Button>
        </$GridCell>
        {allowPublish && (
          <$GridCell $colSpan={3}>
            <Button
              variant="success"
              disabled={isSubmitting}
              iconLeft={<IconUpload />}
              onClick={handleSubmit(publishPostingHandler)}
            >
              {t('common:editor.publish')}
            </Button>
          </$GridCell>
        )}
      </$GridCell>
    </FormSection>
  );
};

export default ActionButtons;
