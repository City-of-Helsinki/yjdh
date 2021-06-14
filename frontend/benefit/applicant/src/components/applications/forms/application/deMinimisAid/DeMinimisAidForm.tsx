import { StyledSubActionContainer } from 'benefit/applicant/components/applications/forms/application/styled';
import { StyledSecondaryButton } from 'benefit/applicant/components/applications/styled';
import { DE_MINIMIS_AID_FIELDS } from 'benefit/applicant/constants';
import { DateInput, IconPlusCircle, NumberInput, TextInput } from 'hds-react';
import React from 'react';
import {
  StyledFieldsContainerWithPadding,
  StyledFormGroup,
  StyledSubHeader,
} from 'shared/components/forms/section/styled';
import theme from 'shared/styles/theme';

import { useComponent } from './extended';

const DeMinimisAidForm: React.FC = () => {
  const {
    t,
    handleSubmit,
    getErrorMessage,
    fields,
    translationsBase,
    formik,
  } = useComponent();

  return (
    <>
      <StyledSubHeader>
        {t(`${translationsBase}.deMinimisAidsHeading`)}
      </StyledSubHeader>
      <>
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
              onChange={(value) =>
                formik.setFieldValue(fields.deMinimisAidIssueDate.name, value)
              }
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
              onClick={(e) => handleSubmit(e)}
              variant="secondary"
              iconLeft={<IconPlusCircle />}
            >
              {t(`${translationsBase}.deMinimisAidsAdd`)}
            </StyledSecondaryButton>
          </StyledSubActionContainer>
        </StyledFormGroup>
      </>
    </>
  );
};

export default DeMinimisAidForm;
