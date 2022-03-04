import { useContext } from 'react';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormSection from 'shared/components/forms/section/FormSection';
import TetPosting from 'tet/admin/types/tetposting';
import { $Grid, $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';
import { IconCross, IconEye, IconUpload } from 'hds-react';
import useConfirm from 'tet/admin/hooks/context/useConfirm';
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import useDeleteTetPosting from 'tet/admin/hooks/backend/useDeleteTetPosting';
import cloneDeep from 'lodash/cloneDeep';

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
    const isConfirmed = await confirm(
      t('common:delete.confirmation', { posting: posting.title }),
      t('common:delete.deletePosting'),
    );

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
