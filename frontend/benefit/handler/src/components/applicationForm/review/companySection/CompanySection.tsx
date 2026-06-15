import AttachmentsListView from 'benefit/handler/components/attachmentsListView/AttachmentsListView';
import { ReviewChildProps } from 'benefit/handler/types/common';
import { ATTACHMENT_TYPES, ORGANIZATION_TYPES } from 'benefit-shared/constants';
import { friendlyFormatIBAN } from 'ibantools';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';
import { DefaultTheme, useTheme } from 'styled-components';

import {
  $SummaryTableHeader,
  $SummaryTableLastLine,
  $SummaryTableValue,
  $ViewField,
  $ViewFieldBold,
} from '../../ApplicationForm.sc';
import EditButton from '../summarySection/EditButton';
import SummarySection from '../summarySection/SummarySection';

type TranslationProps = {
  translationsBase: string;
  t: TFunction;
};

type CompanyBusinessBriefProps = {
  businessBrief?: string;
};

const CompanyBusinessBrief: React.FC<CompanyBusinessBriefProps> = ({
  businessBrief,
}) => (
  <$ViewField>
    {businessBrief == null ? (
      '-'
    ) : (
      <>
        {businessBrief.split(/\n+/g).map((paragraph: string) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </>
    )}
  </$ViewField>
);

type AlternativeAddressProps = {
  data: ReviewChildProps['data'];
} & TranslationProps;

const AlternativeAddress: React.FC<AlternativeAddressProps> = ({
  data,
  translationsBase,
  t,
}) => {
  if (!data.alternativeCompanyStreetAddress) {
    return null;
  }

  return (
    <$GridCell $colSpan={6}>
      <$ViewFieldBold>
        {t(`${translationsBase}.fields.alternativeAddress.label`)}
      </$ViewFieldBold>
      <$ViewField>
        {data.companyDepartment && <div>{data.companyDepartment}</div>}
        {[
          data.alternativeCompanyStreetAddress,
          data.alternativeCompanyPostcode,
          data.alternativeCompanyCity,
        ]
          .join(', ')
          .trim()}
      </$ViewField>
    </$GridCell>
  );
};

type AssociationBusinessActivitiesProps = {
  data: ReviewChildProps['data'];
} & TranslationProps;

const AssociationBusinessActivities: React.FC<
  AssociationBusinessActivitiesProps
> = ({ data, translationsBase, t }) => {
  if (data?.company?.organizationType !== ORGANIZATION_TYPES.ASSOCIATION) {
    return null;
  }

  return (
    <$GridCell $colSpan={6} $colStart={1}>
      <$ViewFieldBold>
        {t(`${translationsBase}.fields.associationHasBusinessActivities.label`)}
      </$ViewFieldBold>
      <$ViewField>
        {data?.associationHasBusinessActivities
          ? t(`${translationsBase}.fields.associationHasBusinessActivities.yes`)
          : t(`${translationsBase}.fields.associationHasBusinessActivities.no`)}
      </$ViewField>
    </$GridCell>
  );
};

type DeMinimisAidSectionProps = {
  data: ReviewChildProps['data'];
  dispatchStep: ReviewChildProps['dispatchStep'];
  fields: ReviewChildProps['fields'];
  theme: DefaultTheme;
} & TranslationProps;

const DeMinimisAidSection: React.FC<DeMinimisAidSectionProps> = ({
  data,
  dispatchStep,
  fields,
  theme,
  translationsBase,
  t,
}) => {
  if (!data.deMinimisAidSet || data.deMinimisAidSet.length === 0) {
    return null;
  }

  return (
    <SummarySection
      gap={theme.spacing.xs3}
      header={t(`${translationsBase}.headings.company6`)}
      action={
        <EditButton
          section={fields?.deMinimisAidSet?.name ?? ''}
          dispatchStep={dispatchStep}
        />
      }
    >
      <$GridCell $colSpan={3}>
        <$SummaryTableHeader>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.deMinimisAidGranter.label`)}
          </$ViewFieldBold>
        </$SummaryTableHeader>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <$SummaryTableHeader>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.deMinimisAidAmount.review`)}
          </$ViewFieldBold>
        </$SummaryTableHeader>
      </$GridCell>
      <$GridCell>
        <$SummaryTableHeader>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.deMinimisAidGrantedAt.review`)}
          </$ViewFieldBold>
        </$SummaryTableHeader>
      </$GridCell>
      {data.deMinimisAidSet.map(({ granter, grantedAt, amount }) => (
        <React.Fragment
          key={`${granter ?? ''}${convertToUIDateFormat(grantedAt)}`}
        >
          <$GridCell $colStart={1} $colSpan={3}>
            <$SummaryTableValue>{granter}</$SummaryTableValue>
          </$GridCell>
          <$GridCell $colSpan={2}>
            <$SummaryTableValue>
              {formatFloatToEvenEuros(amount || 0)}
            </$SummaryTableValue>
          </$GridCell>
          <$GridCell>
            <$SummaryTableValue>
              {grantedAt ? convertToUIDateFormat(grantedAt) : ''}
            </$SummaryTableValue>
          </$GridCell>
        </React.Fragment>
      ))}
      <$GridCell $colSpan={3} $colStart={1}>
        <$SummaryTableLastLine>
          {t(`${translationsBase}.fields.deMinimisAidAmount.reviewTotal`)}
        </$SummaryTableLastLine>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <$SummaryTableLastLine>
          {formatFloatToEvenEuros(data.totalDeminimisAmount || 0)}
        </$SummaryTableLastLine>
      </$GridCell>
    </SummarySection>
  );
};

type CoOperationNegotiationsDescriptionProps = {
  description?: string;
} & TranslationProps;

const CoOperationNegotiationsDescription: React.FC<
  CoOperationNegotiationsDescriptionProps
> = ({ description, translationsBase, t }) => {
  if (!description) {
    return null;
  }

  return (
    <>
      <$ViewFieldBold>
        {t(`${translationsBase}.fields.coOperationNegotiations.description`)}
      </$ViewFieldBold>
      <$ViewField>{description}</$ViewField>
    </>
  );
};

const CompanySection: React.FC<ReviewChildProps> = ({
  data,
  translationsBase,
  dispatchStep,
  fields,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <SummarySection
        header={t(`${translationsBase}.headings.company1`)}
        action={
          <EditButton section="companySection" dispatchStep={dispatchStep} />
        }
      >
        <$GridCell $colSpan={6}>
          <$ViewFieldBold large>{data.company?.name}</$ViewFieldBold>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyBusinessId.label`)}
          </$ViewFieldBold>
          <$ViewField>{data.company?.businessId}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.address.label`)}
          </$ViewFieldBold>
          <$ViewField>{`${data.company?.streetAddress || ''}, ${
            data.company?.postcode || ''
          } ${data.company?.city || ''}`}</$ViewField>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyBankAccountNumber.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {friendlyFormatIBAN(data?.companyBankAccountNumber)}
          </$ViewField>
        </$GridCell>

        <AlternativeAddress
          data={data}
          translationsBase={translationsBase}
          t={t}
        />
        <AssociationBusinessActivities
          data={data}
          translationsBase={translationsBase}
          t={t}
        />

        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyNumberOfEmployees.label`)}
          </$ViewFieldBold>
          <$ViewField>{data?.companyNumberOfEmployees ?? '-'}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={12} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyBusinessBrief.label`)}
          </$ViewFieldBold>
          <CompanyBusinessBrief businessBrief={data.companyBusinessBrief} />
        </$GridCell>
        <$GridCell $colStart={1} $colSpan={6}>
          <AttachmentsListView
            type={ATTACHMENT_TYPES.BUSINESS_BRIEF}
            title={t(
              `${translationsBase}.attachments.types.businessBrief.title`
            )}
            attachments={data.attachments || []}
          />
        </$GridCell>
        <$GridCell $colStart={1} $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.purchasedService.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {data?.purchasedService == null ?
              '-'
              :
              t(`${translationsBase}.fields.purchasedService.${data.purchasedService
                ?
                'yes'
                :
                'no'}`)}
          </$ViewField>
        </$GridCell>
      </SummarySection>

      <SummarySection
        header={t(`${translationsBase}.headings.company2`)}
        action={
          <EditButton
            section={fields?.companyContactPersonFirstName?.name ?? ''}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colSpan={6}>
          <$ViewFieldBold large>
            {getFullName(
              data.companyContactPersonFirstName,
              data.companyContactPersonLastName
            )}
          </$ViewFieldBold>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(
              `${translationsBase}.fields.companyContactPersonPhoneNumber.label`
            )}
          </$ViewFieldBold>
          <$ViewField>{data.companyContactPersonPhoneNumber}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.companyContactPersonEmail.review`)}
          </$ViewFieldBold>
          <$ViewField>{data.companyContactPersonEmail}</$ViewField>
        </$GridCell>
        <$GridCell $colSpan={6} $colStart={1}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.applicantLanguage.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {t(`common:languages.${data.applicantLanguage || ''}`)}
          </$ViewField>
        </$GridCell>
      </SummarySection>

      <DeMinimisAidSection
        data={data}
        dispatchStep={dispatchStep}
        fields={fields}
        theme={theme}
        translationsBase={translationsBase}
        t={t}
      />

      <SummarySection
        header={t(`${translationsBase}.headings.company4`)}
        action={
          <EditButton
            section={fields?.coOperationNegotiations?.name ?? ''}
            dispatchStep={dispatchStep}
          />
        }
      >
        <$GridCell $colStart={1} $colSpan={12}>
          <$ViewFieldBold>
            {t(`${translationsBase}.fields.coOperationNegotiations.label`)}
          </$ViewFieldBold>
          <$ViewField>
            {t(
              `${translationsBase}.fields.coOperationNegotiations.${
                data.coOperationNegotiations ? 'yes' : 'no'
              }`
            )}
          </$ViewField>
          <CoOperationNegotiationsDescription
            description={data.coOperationNegotiationsDescription}
            translationsBase={translationsBase}
            t={t}
          />
        </$GridCell>
      </SummarySection>
    </>
  );
};

export default CompanySection;
