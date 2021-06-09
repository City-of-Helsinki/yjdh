import { StyledSubActionContainer } from 'benefit/applicant/components/applications/forms/application/styled';
import { StyledSecondaryButton } from 'benefit/applicant/components/applications/styled';
import { useTranslation } from 'benefit/applicant/i18n';
import { IconMinusCircle } from 'hds-react';
import React from 'react';
import {
  StyledFormGroup,
  StyledViewField,
  StyledViewFieldsContainer,
} from 'shared/components/forms/section/styled';
import theme from 'shared/styles/theme';

const DeMinimisAidsList: React.FC = () => {
  const { t } = useTranslation();
  const translationsBase = 'common:applications.sections.company';

  return (
    <>
      <StyledFormGroup backgroundColor={theme.colors.silverLight}>
        <StyledViewFieldsContainer>
          <StyledViewField>Sisäministeriö</StyledViewField>
          <StyledViewField>50 000 €</StyledViewField>
          <StyledViewField>10.9.2020</StyledViewField>
        </StyledViewFieldsContainer>
        <StyledSubActionContainer>
          <StyledSecondaryButton
            type="submit"
            variant="secondary"
            iconLeft={<IconMinusCircle />}
          >
            {t(`${translationsBase}.deMinimisAidsRemove`)}
          </StyledSecondaryButton>
        </StyledSubActionContainer>
      </StyledFormGroup>
    </>
  );
};

export default DeMinimisAidsList;
