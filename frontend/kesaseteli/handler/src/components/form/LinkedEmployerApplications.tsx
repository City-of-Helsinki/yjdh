import { Link as HdsLink } from 'hds-react';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import ActivatedYouthApplication from 'kesaseteli-shared/types/activated-youth-application';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $Notification } from 'shared/components/notification/Notification.sc';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

type Props = {
  employerApplications?: ActivatedYouthApplication['employer_applications'];
};

const $EmployerApplicationsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  margin-top: ${(props) => props.theme.spacing.s};
`;

const LinkedEmployerApplications: React.FC<Props> = ({
  employerApplications,
}) => {
  const { t } = useTranslation();

  if (!employerApplications || employerApplications.length === 0) {
    return null;
  }

  return (
    <$Notification
      label={t('common:handlerApplication.employerApplicationsTitle')}
      type="info"
    >
      <$EmployerApplicationsList>
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
    </$Notification>
  );
};

export default LinkedEmployerApplications;
