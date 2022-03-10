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
import TetPosting from 'tet/admin/types/tetposting';

type Props = {
  onSubmit: () => void;
  allowDelete: boolean;
};

const ActionButtons: React.FC<Props> = ({ onSubmit, allowDelete = true }) => {
  const { setPreviewVisibility, setTetPostingData } = useContext(PreviewContext);
  const deleteTetPosting = useDeleteTetPosting();
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
    await showConfirm();
  };

  const showConfirm = async () => {
    const isConfirmed = await confirm({
      header: t('common:delete.confirmation', { posting: posting.title }),
      submitButtonLabel: t('common:delete.deletePosting'),
    });

    if (isConfirmed) {
      deleteTetPosting.mutate(posting);
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
        <$GridCell $colSpan={3} style={{ textAlign: 'right' }}>
          <Button disabled={isSubmitting} iconLeft={<IconEye />} onClick={showPreview}>
            {t('common:editor.preview')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={3} style={{ textAlign: 'right' }}>
          <Button
            variant="success"
            disabled={isSubmitting}
            iconLeft={<IconUpload />}
            onClick={() => alert('Not implemented')}
          >
            {t('common:editor.publish')}
          </Button>
        </$GridCell>
      </$GridCell>
    </FormSection>
  );
};

export default ActionButtons;
