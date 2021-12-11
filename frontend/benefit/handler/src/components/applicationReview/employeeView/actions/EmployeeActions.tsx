import { APPLICATION_STATUSES, ROUTES } from 'benefit/handler/constants';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import {
  Application,
  ApplicationData,
} from 'benefit/handler/types/application';
import { Button, IconPlus } from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import snakecaseKeys from 'snakecase-keys';
import { useTheme } from 'styled-components';

import { $Wrapper } from './EmployeeActions.sc';

export type Props = {
  application: Application;
};

const EmployeeActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const handleCloseClick = (): void => {
    void router.push(ROUTES.HOME);
  };

  const handleStatusChange = (): void => {
    const currentApplicationData: ApplicationData = snakecaseKeys(
      {
        ...application,
        status: APPLICATION_STATUSES.HANDLING,
      },
      { deep: true }
    );
    updateApplication(currentApplicationData);
  };

  return (
    <$Wrapper>
      <$Grid>
        <$GridCell
          $colSpan={3}
          css={`
            margin-bottom: ${theme.spacing.m};
          `}
        >
          <Button
            css={`
              width: 100%;
              background-color: ${theme.colors.white};
            `}
            onClick={handleStatusChange}
            theme="black"
            variant="secondary"
            iconLeft={<IconPlus />}
          >
            {t(`${translationsBase}.addAttachment`)}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={3}>
          <Button
            css={`
              background-color: ${theme.colors.white};
            `}
            onClick={handleCloseClick}
            theme="black"
            variant="secondary"
            iconLeft={<IconPlus />}
          >
            {t(`${translationsBase}.addPreviouslyGrantedBenefit`)}
          </Button>
        </$GridCell>
      </$Grid>
      <$Grid>
        <$GridCell
          $colSpan={2}
          css={`
            margin-bottom: ${theme.spacing.s};
          `}
        >
          <$Checkbox
            css={`
              input {
                background-color: ${theme.colors.white};
              }
            `}
            id="id"
            name="name"
            label="Kohderyhmätarkistus"
            checked={false}
            onChange={noop}
          />
        </$GridCell>
      </$Grid>
    </$Wrapper>
  );
};

export default EmployeeActions;
