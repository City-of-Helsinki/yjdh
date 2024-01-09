import { ROUTES } from 'benefit/handler/constants';
import { UploadProps } from 'benefit/handler/types/application';
import { Button, IconGlyphEuro } from 'hds-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import { $ActionsWrapper } from '../../ApplicationReview.sc';

const EmployeeActions: React.FC<UploadProps> = () => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const handleCloseClick = (): void => {
    void router.push(ROUTES.HOME);
  };

  return (
    <$ActionsWrapper>
      <$Grid>
        <$GridCell $colSpan={3}>
          <Button
            css={`
              background-color: ${theme.colors.white};
            `}
            onClick={handleCloseClick}
            theme="black"
            variant="secondary"
            iconLeft={<IconGlyphEuro />}
          >
            {t(`${translationsBase}.addPreviouslyGrantedBenefit`)}
          </Button>
        </$GridCell>
      </$Grid>
    </$ActionsWrapper>
  );
};

export default EmployeeActions;
