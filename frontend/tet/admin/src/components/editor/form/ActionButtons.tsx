import { Button, IconCross, IconEye, IconUpload } from 'hds-react';
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
    } else {
      console.log('not confirmed');
    }
  };

  return (
    <FormSection withoutDivider>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={3}>
          <Button onClick={onSubmit} color={theme.colors.black90} disabled={isSubmitting}>
            {t('common:editor.saveDraft')}
          </Button>
        </$GridCell>
        {allowDelete ? (
          <$GridCell $colSpan={2}>
            <Button
              variant="supplementary"
              iconLeft={<IconCross />}
              disabled={isSubmitting}
              onClick={deletePostingHandler}
            >
              {t('common:editor.deletePosting')}
            </Button>
          </$GridCell>
        ) : (
          <$GridCell $colSpan={2}>{null}</$GridCell>
        )}
        <$GridCell $colSpan={2}>{null}</$GridCell>
        <$GridCell $colSpan={3}>
          <Button disabled={isSubmitting} iconLeft={<IconEye />} onClick={showPreview}>
            {t('common:editor.preview')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={2}>
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
