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
import InfoDialog from 'tet/admin/components/InfoDialog';

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
    formState: { isSubmitting, isDirty },
    reset,
  } = useFormContext<TetPosting>();
  const theme = useTheme();
  const posting = getValues();
  const [showInfoDialog, setShowInfoDialog] = React.useState(false);

  console.log('test');

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
    const event = tetPostingToEvent({
      posting: validatedPosting,
    });
    reset({ ...posting }, { keepValues: true });
    upsertTetPosting.mutate({
      id: validatedPosting.id,
      event,
    });
  };

  const saveDraftHandler = (): void => {
    reset({ ...posting }, { keepValues: true });
    if (
      posting.title === '' ||
      posting.org_name === '' ||
      posting.location?.value === '' ||
      posting.location === null
    ) {
      setShowInfoDialog(true);
    } else {
      const event = tetPostingToEvent({ posting });

      upsertTetPosting.mutate({
        id: posting.id,
        event,
      });
    }
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
          {allowPublish ? (
            <Button
              onClick={saveDraftHandler}
              disabled={isSubmitting}
              iconLeft={<IconSaveDiskette />}
              css={`
                background-color: transparent;
                color: ${theme.colors.black90};
                border: ${theme.colors.black90} !important;
              `}
            >
              {t('common:editor.saveDraft')}
            </Button>
          ) : (
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
              {t('common:editor.savePublished')}
            </Button>
          )}
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
      <InfoDialog isOpen={showInfoDialog} close={() => setShowInfoDialog(false)} />
    </FormSection>
  );
};

export default ActionButtons;
