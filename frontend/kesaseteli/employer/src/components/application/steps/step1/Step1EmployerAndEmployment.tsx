import ApplicationForm from 'kesaseteli/employer/components/application/ApplicationForm';
import ActionButtons from 'kesaseteli/employer/components/application/form/ActionButtons';
import EmployerForm from 'kesaseteli/employer/components/application/steps/step1/EmployerForm';
import EmploymentForm from 'kesaseteli/employer/components/application/steps/step1/EmploymentForm';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { useTranslation } from 'next-i18next';
import React from 'react';

const Step1EmployerAndEmployment: React.FC = () => {
    const { t } = useTranslation();
    const { applicationQuery } = useApplicationApi();

    // Validating structure
    const vouchers = applicationQuery.data?.summer_vouchers || [];
    const currentVoucherIndex = vouchers.length > 0 ? vouchers.length - 1 : 0;

    return (
        <ApplicationForm title={t('common:application.step1.header')} step={1}>
            <EmployerForm />
            <EmploymentForm index={currentVoucherIndex} />
            <ActionButtons />
        </ApplicationForm>
    );
};

export default Step1EmployerAndEmployment;
