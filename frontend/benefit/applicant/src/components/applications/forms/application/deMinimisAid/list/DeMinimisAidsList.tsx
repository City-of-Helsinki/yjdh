import { $SecondaryButton } from 'benefit/applicant/components/applications/Applications.sc';
import { $SubActionContainer } from 'benefit/applicant/components/applications/forms/application/Application.sc';
import {
  DE_MINIMIS_AID_FIELDS,
  MAX_DEMINIMIS_AID_TOTAL_AMOUNT,
} from 'benefit/applicant/constants';
import { IconMinusCircle, Notification } from 'hds-react';
import sumBy from 'lodash/sumBy';
import React from 'react';
import {
  $FormGroup,
  $ViewField,
  $ViewFieldsContainer,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { formatDate, parseDate } from 'shared/utils/date.utils';

import { useDeminimisAidsList } from './useDeminimisAidsList';

const DeMinimisAidsList: React.FC = () => {
  const { grants, t, translationsBase, handleRemove } = useDeminimisAidsList();

  return (
    <>
      {grants?.map((grant, i) => (
        <$FormGroup
          backgroundColor={theme.colors.silverLight}
          key={`${grant[DE_MINIMIS_AID_FIELDS.GRANTER]}${
            grant[DE_MINIMIS_AID_FIELDS.AMOUNT]
          }${grant[DE_MINIMIS_AID_FIELDS.GRANTED_AT]}`}
        >
          <$ViewFieldsContainer>
            <$ViewField>{grant[DE_MINIMIS_AID_FIELDS.GRANTER]}</$ViewField>
            <$ViewField>{`${
              grant[DE_MINIMIS_AID_FIELDS.AMOUNT]
            } €`}</$ViewField>
            <$ViewField>
              {formatDate(
                parseDate(grant[DE_MINIMIS_AID_FIELDS.GRANTED_AT], 'yyyy-MM-dd')
              )}
            </$ViewField>
          </$ViewFieldsContainer>
          <$SubActionContainer>
            <$SecondaryButton
              onClick={() => handleRemove(i)}
              variant="secondary"
              iconLeft={<IconMinusCircle />}
            >
              {t(`${translationsBase}.deMinimisAidsRemove`)}
            </$SecondaryButton>
          </$SubActionContainer>
        </$FormGroup>
      ))}
      {sumBy(grants, 'amount') > MAX_DEMINIMIS_AID_TOTAL_AMOUNT && (
        <$FormGroup>
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
        </$FormGroup>
      )}
    </>
  );
};

export default DeMinimisAidsList;
