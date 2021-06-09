import { StyledSubActionContainer } from 'benefit/applicant/components/applications/forms/application/styled';
import { StyledSecondaryButton } from 'benefit/applicant/components/applications/styled';
import { DateInput, IconPlusCircle, NumberInput, TextInput } from 'hds-react';
import React from 'react';
import {
  StyledFieldsContainerWithPadding,
  StyledFormGroup,
  StyledSubHeader,
} from 'shared/components/forms/section/styled';
import theme from 'shared/styles/theme';

import { DE_MINIMIS_AID_FIELDS } from '../../../constants';
import { DeMinimisAidProps, useComponent } from './extended';

const DeMinimisAid: React.FC<DeMinimisAidProps> = ({ onSubmit }) => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
  } = useComponent(onSubmit);

  return (
    <>
      <StyledSubHeader>
        {t(`${translationsBase}.deMinimisAidsHeading`)}
      </StyledSubHeader>
      <form onSubmit={handleSubmit} noValidate>
        <StyledFormGroup backgroundColor={theme.colors.silverLight}>
          <StyledFieldsContainerWithPadding>
            <TextInput
              id={fields.deMinimisAidGranter.name}
              name={fields.deMinimisAidGranter.name}
              label={fields.deMinimisAidGranter.label}
              placeholder={fields.deMinimisAidGranter.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.deMinimisAidGranter}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.GRANTER)}
              required
            />
            <NumberInput
              id={fields.deMinimisAidAmount.name}
              name={fields.deMinimisAidAmount.name}
              label={fields.deMinimisAidAmount.label || ''}
              unit={fields.deMinimisAidAmount.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.deMinimisAidAmount}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.AMOUNT)}
              required
            />
            <DateInput
              id={fields.deMinimisAidIssueDate.name}
              name={fields.deMinimisAidIssueDate.name}
              label={fields.deMinimisAidIssueDate.label}
              placeholder={fields.deMinimisAidIssueDate.placeholder}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.deMinimisAidIssueDate}
              invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.ISSUE_DATE)}
              aria-invalid={!!getErrorMessage(DE_MINIMIS_AID_FIELDS.ISSUE_DATE)}
              errorText={getErrorMessage(DE_MINIMIS_AID_FIELDS.ISSUE_DATE)}
              required
            />
          </StyledFieldsContainerWithPadding>
          <StyledSubActionContainer>
            <StyledSecondaryButton
              type="submit"
              variant="secondary"
              iconLeft={<IconPlusCircle />}
            >
              Lisää
            </StyledSecondaryButton>
          </StyledSubActionContainer>
        </StyledFormGroup>
      </form>
    </>
  );
};

export default DeMinimisAid;
