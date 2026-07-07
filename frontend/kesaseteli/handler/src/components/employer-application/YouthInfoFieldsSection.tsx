import { Link } from 'hds-react';
import { ROUTES } from 'kesaseteli-shared/constants/routes';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import styled from 'styled-components';

import type { HandlerSummerVoucher } from '../../types/HandlerEmployerApplication';
import Field, { $DescriptionList } from '../form/Field';

type Props = {
  voucher: HandlerSummerVoucher;
};

const $LinkContainer = styled.div`
  margin-top: var(--spacing-m);
`;

/**
 * Renders the youth applicant information section (name, birthdate, school,
 * phone number, home city, postcode, and a link to their original application).
 */
const YouthInfoFieldsSection: React.FC<Props> = ({ voucher }) => {
  const { t } = useTranslation();

  return (
    <FormSection columns={1} withoutDivider>
      <FormSectionHeading
        id="youth-info-heading"
        header={t('common:handlerApplication.youthApplicationTitle')}
        as="h4"
      />

      <$DescriptionList aria-labelledby="youth-info-heading">
        <Field type="employee_name" value={voucher.employee_name ?? '-'} />
        <Field
          type="employee_birthdate"
          value={convertToUIDateFormat(voucher.employee_birthdate) || '-'}
        />
        <Field type="employee_school" value={voucher.employee_school ?? '-'} />
        <Field
          type="employee_phone_number"
          value={voucher.employee_phone_number ?? '-'}
        />
        <Field
          type="employee_home_city"
          value={voucher.employee_home_city ?? '-'}
        />
        <Field
          type="employee_postcode"
          value={voucher.employee_postcode ?? '-'}
        />
      </$DescriptionList>

      {voucher.youth_application_id && (
        <$LinkContainer>
          <Link
            href={`${ROUTES.YOUTH_APPLICATIONS}/${voucher.youth_application_id}`}
          >
            {t('common:handlerApplication.youthApplicationLink')}
          </Link>
        </$LinkContainer>
      )}
    </FormSection>
  );
};

export default YouthInfoFieldsSection;
