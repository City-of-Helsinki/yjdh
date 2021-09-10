import { Application } from 'benefit/applicant/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';

import {
  $ViewField,
  $ViewFieldBold,
  $ViewFieldsContainer,
  $ViewFieldsGroup,
} from '../../Application.sc';

export interface EmployeeViewProps {
  data: Application;
}

const EmployeeView: React.FC<EmployeeViewProps> = ({ data }) => {
  const translationsBase = 'common:applications.sections';
  const { t } = useTranslation();
  return (
    <>
      <Heading
        as="h2"
        header={t(`${translationsBase}.employee.heading1Short`)}
      />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewField>{`${data.employee?.firstName || ''} ${
            data.employee?.lastName || ''
          }`}</$ViewField>
          <$ViewField>{data.employee?.socialSecurityNumber}</$ViewField>
          <$ViewField>{data.employee?.phoneNumber}</$ViewField>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.isLivingInHelsinki.label`)}
            {': '}
            <$ViewFieldBold>
              {t(
                `${translationsBase}.employee.fields.isLivingInHelsinki.${
                  data.employee?.isLivingInHelsinki ? 'yes' : 'no'
                }`
              )}
            </$ViewFieldBold>
          </$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
      <Heading as="h2" header={t(`${translationsBase}.employee.heading2`)} />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewFieldBold>
            {t(
              `${translationsBase}.employee.fields.paySubsidyGranted.${
                data.paySubsidyGranted ? 'yes' : 'no'
              }`
            ) || ''}
            {data.apprenticeshipProgram && (
              <$ViewField>{`, ${data.paySubsidyPercent || ''} %`}</$ViewField>
            )}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `${translationsBase}.employee.fields.apprenticeshipProgram.label`
            )}{' '}
            {data.apprenticeshipProgram && (
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.employee.fields.apprenticeshipProgram.${
                    data.apprenticeshipProgram ? 'yes' : 'no'
                  }`
                )}
              </$ViewFieldBold>
            )}
          </$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>{' '}
      <Heading
        as="h2"
        header={t(`${translationsBase}.employee.heading3Long`)}
      />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewField>
            {`${t(`${translationsBase}.employee.fields.benefitType.label`)}: `}
            {data.apprenticeshipProgram && (
              <$ViewFieldBold>
                {t(
                  `${translationsBase}.employee.fields.benefitType.${
                    data.benefitType?.split('_')[0] || ''
                  }`
                )}
              </$ViewFieldBold>
            )}
          </$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.startDate.label`)}
          </$ViewField>
          <$ViewField>{data.startDate ? data.startDate : '-'}</$ViewField>
        </$ViewFieldsGroup>
        <$ViewFieldsGroup>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.endDate.label`)}
          </$ViewField>
          <$ViewField>{data.endDate ? data.endDate : '-'}</$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
      <Heading
        as="h2"
        header={t(`${translationsBase}.employee.heading5Employment`)}
      />
      <$ViewFieldsContainer>
        <$ViewFieldsGroup>
          <$ViewField>
            {`${t(`${translationsBase}.employee.fields.jobTitle.label`)}: ${
              data.employee?.jobTitle || '-'
            }`}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.workingHours.view`, {
              workingHours: data.employee?.workingHours,
            })}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.monthlyPay.view`, {
              monthlyPay: data.employee?.monthlyPay,
            })}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.otherExpenses.view`, {
              otherExpenses: data.employee?.otherExpenses,
            })}
          </$ViewField>
          <$ViewField>
            {t(`${translationsBase}.employee.fields.vacationMoney.view`, {
              vacationMoney: data.employee?.vacationMoney,
            })}
          </$ViewField>
          <$ViewField>
            {data.employee?.collectiveBargainingAgreement}
          </$ViewField>
        </$ViewFieldsGroup>
      </$ViewFieldsContainer>
    </>
  );
};

export default EmployeeView;
