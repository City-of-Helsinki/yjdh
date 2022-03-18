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
import usePublishTetPosting from 'tet/admin/hooks/backend/usePublishTetPosting';

type Props = {
  onSubmit: () => void;
  allowDelete: boolean;
  allowPublish: boolean;
};

const ActionButtons: React.FC<Props> = ({ onSubmit, allowDelete = true, allowPublish }) => {
  const { setPreviewVisibility, setTetPostingData } = useContext(PreviewContext);
  const deleteTetPosting = useDeleteTetPosting();
  const publishTetPosting = usePublishTetPosting();
  const { confirm } = useConfirm();

  const { t } = useTranslation();
  const {
    getValues,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();
  const theme = useTheme();
  const posting = getValues();

  const showPreview = () => {
    const values = getValues();
    setTetPostingData(cloneDeep(values));
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

  const publishPostingHandler = async () => {
    const isConfirmed = await confirm({
      header: t('common:publish.confirmation', { posting: posting.title }),
      content: t('common:application.publishTerms'),
      linkText: t('common:application.termsLink'),
      link: '/TET-alusta-kayttoehdot.pdf',
      submitButtonLabel: t('common:publish.publishPosting'),
    });

    if (isConfirmed) {
      publishTetPosting.mutate(posting);
    }
  };

  return (
    <FormSection withoutDivider>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={3}>
          <Button
            onClick={onSubmit}
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
            <Button variant="success" disabled={isSubmitting} iconLeft={<IconUpload />} onClick={publishPostingHandler}>
              {t('common:editor.publish')}
            </Button>
          </$GridCell>
        )}
      </$GridCell>
    </FormSection>
  );
};

export default ActionButtons;
