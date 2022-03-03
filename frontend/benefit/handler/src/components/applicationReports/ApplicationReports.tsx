import * as React from 'react';
import { DateInput } from 'hds-react';
import { $Heading } from '../applicationsArchive/ApplicationsArchive.sc';
import { useApplicationReports } from './useApplicationReports';
import ReportsSection from './ReportsSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import Container from 'shared/components/container/Container';
import DateInputWithSeparator from 'shared/components/forms/fields/dateInputWithSeparator/DateInputWithSeparator';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { EXPORT_APPLICATIONS_ROUTES } from 'benefit/handler/constants';

const ApplicationReports: React.FC = () => {
  const {
    t,
    translationsBase,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    exportApplication,
  } = useApplicationReports();
  const today = convertToUIDateFormat(new Date());

  return (
    <Container>
      <$Heading>{`${t(`${translationsBase}.headings.main`)}`}</$Heading>

      <ReportsSection
        onDownloadButtonClick={() =>
          exportApplication(EXPORT_APPLICATIONS_ROUTES.ACCEPTED)
        }
        header={`${t(
          `${translationsBase}.headings.downloadAcceptedApplications`
        )}`}
        buttonText={`${t(
          `${translationsBase}.buttons.downloadAcceptedApplications`
        )}`}
        withDivider
      >
        <$GridCell $colSpan={11}>
          <label>{`${t(`${translationsBase}.fields.lastDownloadDateText`, {
            date: today,
          })}`}</label>
        </$GridCell>
      </ReportsSection>

      <ReportsSection
        onDownloadButtonClick={() =>
          exportApplication(EXPORT_APPLICATIONS_ROUTES.REJECTED)
        }
        header={`${t(
          `${translationsBase}.headings.downloadRejectedApplications`
        )}`}
        buttonText={`${t(
          `${translationsBase}.buttons.downloadRejectedApplications`
        )}`}
        withDivider
      >
        <$GridCell $colSpan={11}>
          <label>{`${t(`${translationsBase}.fields.lastDownloadDateText`, {
            date: today,
          })}`}</label>
        </$GridCell>
      </ReportsSection>

      <ReportsSection
        onDownloadButtonClick={() =>
          exportApplication(EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE)
        }
        header={`${t(
          `${translationsBase}.headings.downloadApplicationsInTimeRange`
        )}`}
        buttonText={`${t(
          `${translationsBase}.buttons.downloadApplicationsInTimeRange`
        )}`}
      >
        <$GridCell $colSpan={3} css="font-weight: 500;">{`${t(
          `${translationsBase}.fields.startDate`
        )}`}</$GridCell>
        <$GridCell $colSpan={3} css="font-weight: 500;">{`${t(
          `${translationsBase}.fields.endDate`
        )}`}</$GridCell>
        <$GridCell $colStart={1} $colSpan={3}>
          <DateInputWithSeparator
            id={`${t(`${translationsBase}.fields.startDate`)}`}
            name={`${t(`${translationsBase}.fields.startDate`)}`}
            placeholder={`${t(`${translationsBase}.fields.startDate`)}`}
            value={convertToUIDateFormat(startDate)}
            onChange={(value) => setStartDate(value)}
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id={`${t(`${translationsBase}.fields.endDate`)}`}
            name={`${t(`${translationsBase}.fields.endDate`)}`}
            placeholder={`${t(`${translationsBase}.fields.endDate`)}`}
            value={convertToUIDateFormat(endDate)}
            onChange={(value) => setEndDate(value)}
          />
        </$GridCell>
      </ReportsSection>
    </Container>
  );
};

export default ApplicationReports;
