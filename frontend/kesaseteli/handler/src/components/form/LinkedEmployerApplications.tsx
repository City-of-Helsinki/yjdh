import { Link as HdsLink } from 'hds-react';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

type Props = {
  employerApplications?: ActivatedYouthApplication['employer_applications'];
};

const $EmployerCard = styled.div`
  background-color: var(--color-bus-light);
  border: 1px solid ${(props) => props.theme.colors.black10};
  padding: ${(props) => props.theme.spacing.m};
  display: grid;
  grid-template-columns: 1fr;
  align-content: start;
`;

const $EmployerApplicationsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const $DescriptionText = styled.p`
  margin-top: 0;
  margin-bottom: ${(props) => props.theme.spacing.m};
  font-size: ${(props) => props.theme.fontSize.body.m};
  color: ${(props) => props.theme.colors.black80};
`;

const LinkedEmployerApplications: React.FC<Props> = ({
  employerApplications,
}) => {
  const { t } = useTranslation();

  if (!employerApplications || employerApplications.length === 0) {
    return null;
  }

  // NOTE: For historical reasons, ther emight be some (rare) cases where there
  // could be more than 1 employer applicaiton linked to this youth application.

  const isPlural = employerApplications.length > 1;
  const titleKey = isPlural
    ? 'common:handlerApplication.employerApplicationsTitle'
    : 'common:handlerApplication.employerApplicationTitleLinked';
  const descriptionKey = isPlural
    ? 'common:handlerApplication.employerApplicationsDescription'
    : 'common:handlerApplication.employerApplicationDescription';

  return (
    <$EmployerCard>
      <FormSectionHeading
        id="employer-applications-heading"
        header={t(titleKey)}
        as="h4"
      />
      <$DescriptionText>{t(descriptionKey)}</$DescriptionText>
      <$EmployerApplicationsList aria-labelledby="employer-applications-heading">
        {employerApplications.map((empApp) => (
          <li key={empApp.id}>
            <NextLink
              href={`${ROUTES.EMPLOYER_APPLICATIONS}/${empApp.id}`}
              passHref
              legacyBehavior
            >
              <HdsLink href={`${ROUTES.EMPLOYER_APPLICATIONS}/${empApp.id}`}>
                {t('common:handlerApplication.employerApplicationLinkText', {
                  companyName: empApp.company_name,
                  date: convertToUIDateFormat(empApp.submitted_at),
                })}
              </HdsLink>
            </NextLink>
          </li>
        ))}
      </$EmployerApplicationsList>
    </$EmployerCard>
  );
};

export default LinkedEmployerApplications;
