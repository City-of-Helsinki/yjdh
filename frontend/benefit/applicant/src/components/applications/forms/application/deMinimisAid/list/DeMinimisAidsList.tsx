import { $Notification } from 'benefit/applicant/components/Notification/Notification.sc';
import { MAX_DEMINIMIS_AID_TOTAL_AMOUNT } from 'benefit/applicant/constants';
import { DE_MINIMIS_AID_KEYS } from 'benefit-shared/constants';
import { Button, IconTrash } from 'hds-react';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatStringFloatValue } from 'shared/utils/string.utils';
import { useTheme } from 'styled-components';

import { $DeMinimisGrid } from '../deMinimisAid.sc';
import { useDeminimisAidsList } from './useDeminimisAidsList';

const unsavedAidRowKey = (): number => Math.floor(Math.random() * 1000);

const DeMinimisAidsList: React.FC = () => {
  const {
    grants,
    t,
    translationsBase,
    handleRemove,
    deMinimisTotal,
    language,
  } = useDeminimisAidsList();
  const theme = useTheme();

  return (
    <>
      {grants?.map((grant, i) => (
        <$DeMinimisGrid
          key={`${grant[DE_MINIMIS_AID_KEYS.GRANTER] ?? ''}${
            grant[DE_MINIMIS_AID_KEYS.AMOUNT] ?? ''
          }${grant[DE_MINIMIS_AID_KEYS.GRANTED_AT] ?? ''}-${
            grant.id ? grant.id : unsavedAidRowKey()
          }`}
        >
          <$GridCell
            css="margin-left: 15px"
            $colSpan={12}
            as={$Grid}
            columns={12}
            alignItems="center"
            bgHorizontalPadding
            data-testid="deminimis-row"
          >
            <$GridCell $colSpan={4}>
              {grant[DE_MINIMIS_AID_KEYS.GRANTER]}
            </$GridCell>
            <$GridCell $colSpan={2}>{`${formatStringFloatValue(
              grant[DE_MINIMIS_AID_KEYS.AMOUNT]
            )} €`}</$GridCell>
            <$GridCell $colSpan={2}>
              {convertToUIDateFormat(grant[DE_MINIMIS_AID_KEYS.GRANTED_AT])}
            </$GridCell>
            <$GridCell
              $colSpan={4}
              css={`
                margin-left: auto;
                margin-bottom: 0;
                padding-left: ${theme.spacing.s};
              `}
            >
              <Button
                size="small"
                data-testid={`deminimis-remove-${i}`}
                onClick={() => handleRemove(i)}
                variant="supplementary"
                theme="black"
                iconLeft={<IconTrash />}
                fullWidth
              >
                {t(`${translationsBase}.deMinimisAidsRemove`)}
              </Button>
            </$GridCell>
          </$GridCell>
        </$DeMinimisGrid>
      ))}
      {deMinimisTotal() > MAX_DEMINIMIS_AID_TOTAL_AMOUNT && (
        <$GridCell
          $colSpan={8}
          $colStart={3}
          data-testid="deminimis-maxed-notification"
        >
          <$Notification
            label={t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.label`
            )}
            type="error"
          >
            {t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.content`,
              {
                amount: MAX_DEMINIMIS_AID_TOTAL_AMOUNT.toLocaleString(language),
              }
            )}
          </$Notification>
        </$GridCell>
      )}
    </>
  );
};

export default DeMinimisAidsList;
