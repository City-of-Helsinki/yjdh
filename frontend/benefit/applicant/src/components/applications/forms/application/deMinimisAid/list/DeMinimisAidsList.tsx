import {
  DE_MINIMIS_AID_KEYS,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
} from 'benefit/applicant/constants';
import { Button, IconMinusCircle, Notification } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { DATE_FORMATS, formatDate, parseDate } from 'shared/utils/date.utils';
import { useTheme } from 'styled-components';

import { useDeminimisAidsList } from './useDeminimisAidsList';

const DeMinimisAidsList: React.FC = () => {
  const { grants, t, translationsBase, handleRemove } = useDeminimisAidsList();
  const theme = useTheme();

  return (
    <>
      {grants?.map((grant, i) => (
        <$GridCell
          $colStart={3}
          $colSpan={10}
          as={$Grid}
          columns={10}
          key={`${grant[DE_MINIMIS_AID_KEYS.GRANTER] ?? ''}${
            grant[DE_MINIMIS_AID_KEYS.AMOUNT] ?? ''
          }${grant[DE_MINIMIS_AID_KEYS.GRANTED_AT] ?? ''}`}
        >
          <$GridCell
            $colSpan={8}
            as={$Grid}
            columns={8}
            alignItems="center"
            bgColor
            bgHorizontalPadding
          >
            <$GridCell $colSpan={4}>
              {grant[DE_MINIMIS_AID_KEYS.GRANTER]}
            </$GridCell>
            <$GridCell $colSpan={2}>{`${
              grant[DE_MINIMIS_AID_KEYS.AMOUNT] ?? ''
            } €`}</$GridCell>
            <$GridCell $colSpan={2}>
              {grant[DE_MINIMIS_AID_KEYS.GRANTED_AT]
                ? formatDate(
                    parseDate(
                      grant[DE_MINIMIS_AID_KEYS.GRANTED_AT] as string,
                      DATE_FORMATS.DATE_BACKEND
                    )
                  )
                : ''}
            </$GridCell>
          </$GridCell>
          <$GridCell
            $colSpan={2}
            css={`
              padding-left: ${theme.spacing.s};
            `}
          >
            <Button
              onClick={() => handleRemove(i)}
              variant="secondary"
              theme="black"
              iconLeft={<IconMinusCircle />}
              fullWidth
            >
              {t(`${translationsBase}.deMinimisAidsRemove`)}
            </Button>
          </$GridCell>
        </$GridCell>
      ))}
      {sumBy(grants, (grant) => Number(grant.amount)) >
        MAX_DEMINIMIS_AID_TOTAL_AMOUNT && (
        <$GridCell $colSpan={8} $colStart={3}>
          <Notification
            label={t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.label`
            )}
            type="error"
          >
            {t(
              `${translationsBase}.notifications.deMinimisAidMaxAmount.content`
            )}
          </Notification>
        </$GridCell>
      )}
    </>
  );
};

export default DeMinimisAidsList;
