import { StyledSubActionContainer } from 'benefit/applicant/components/applications/forms/application/styled';
import { StyledSecondaryButton } from 'benefit/applicant/components/applications/styled';
import { DE_MINIMIS_AID_FIELDS } from 'benefit/applicant/constants';
import { IconMinusCircle } from 'hds-react';
import React from 'react';
import {
  StyledFormGroup,
  StyledViewField,
  StyledViewFieldsContainer,
} from 'shared/components/forms/section/styled';
import theme from 'shared/styles/theme';

import { useDeminimisAidsList } from './useDeminimisAidsList';

const DeMinimisAidsList: React.FC = () => {
  const { grants, t, translationsBase, handleRemove } = useDeminimisAidsList();

  return (
    <>
      {grants?.map((grant, i) => (
        <StyledFormGroup
          backgroundColor={theme.colors.silverLight}
          key={`${grant[DE_MINIMIS_AID_FIELDS.GRANTER]}${
            grant[DE_MINIMIS_AID_FIELDS.AMOUNT]
          }${grant[DE_MINIMIS_AID_FIELDS.GRANTED_AT]}`}
        >
          <StyledViewFieldsContainer>
            <StyledViewField>
              {grant[DE_MINIMIS_AID_FIELDS.GRANTER]}
            </StyledViewField>
            <StyledViewField>{`${
              grant[DE_MINIMIS_AID_FIELDS.AMOUNT]
            } €`}</StyledViewField>
            <StyledViewField>
              {grant[DE_MINIMIS_AID_FIELDS.GRANTED_AT]}
            </StyledViewField>
          </StyledViewFieldsContainer>
          <StyledSubActionContainer>
            <StyledSecondaryButton
              onClick={() => handleRemove(i)}
              variant="secondary"
              iconLeft={<IconMinusCircle />}
            >
              {t(`${translationsBase}.deMinimisAidsRemove`)}
            </StyledSecondaryButton>
          </StyledSubActionContainer>
        </StyledFormGroup>
      ))}
    </>
  );
};

export default DeMinimisAidsList;
