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
import { PreviewContext } from 'tet/admin/store/PreviewContext';
import cloneDeep from 'lodash/cloneDeep';

type Props = {
  onSubmit: () => void;
};

const ActionButtons: React.FC<Props> = ({ onSubmit }) => {
  const { setPreviewVisibility, setTetPostingData } = useContext(PreviewContext);

  const showPreview = () => {
    setTetPostingData(cloneDeep(getValues()));
    setPreviewVisibility(true);
  };

  const { t } = useTranslation();
  const {
    getValues,
    formState: { isSubmitting },
  } = useFormContext<TetPosting>();
  const theme = useTheme();

  return (
    <FormSection withoutDivider>
      <$GridCell as={$Grid} $colSpan={12}>
        <$GridCell $colSpan={3}>
          <Button onClick={onSubmit} color={theme.colors.black90} disabled={isSubmitting}>
            {t('common:editor.saveDraft')}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={2}>
          <Button
            variant="supplementary"
            iconLeft={<IconCross />}
            disabled={isSubmitting}
            onClick={() => alert('Not implemented')}
          >
            {t('common:editor.deletePosting')}
          </Button>
        </$GridCell>
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
