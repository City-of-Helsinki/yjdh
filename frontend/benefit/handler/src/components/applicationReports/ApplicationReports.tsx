import { DateInput } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import DateInputWithSeparator from 'shared/components/forms/fields/dateInputWithSeparator/DateInputWithSeparator';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import {
  convertToUIDateFormat,
  getCorrectEndDate,
} from 'shared/utils/date.utils';

import { $Heading } from '../applicationsArchive/ApplicationsArchive.sc';
import ReportsSection from './ReportsSection';
import { useApplicationReports } from './useApplicationReports';

const ApplicationReports: React.FC = () => {
  const { t, translationsBase, formik, fields, exportApplicationsInTimeRange } =
    useApplicationReports();

  return (
    <Container>
      <$Heading>{`${t(`${translationsBase}.headings.main`)}`}</$Heading>
      <ReportsSection
        exportFileType="csv"
        onDownloadButtonClick={exportApplicationsInTimeRange}
        header={`${t(
          `${translationsBase}.headings.downloadApplicationsInTimeRange`
        )}`}
        buttonText={`${t(
          `${translationsBase}.buttons.downloadApplicationsInTimeRange`
        )}`}
        isCompact={false}
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
            value={convertToUIDateFormat(formik.values.startDate)}
            onChange={(value) =>
              formik.setFieldValue(fields.startDate.name, value)
            }
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id={`${t(`${translationsBase}.fields.endDate`)}`}
            name={`${t(`${translationsBase}.fields.endDate`)}`}
            placeholder={`${t(`${translationsBase}.fields.endDate`)}`}
            value={convertToUIDateFormat(formik.values.endDate)}
            onChange={(value) =>
              formik.setFieldValue(
                fields.endDate.name,
                getCorrectEndDate(formik.values.startDate, value)
              )
            }
          />
        </$GridCell>
      </ReportsSection>
      <ReportsSection
        exportFileType="csv"
        onDownloadButtonClick={exportApplicationsInTimeRange}
        header={`${t(
          `${translationsBase}.headings.downloadSmallerListOfApplicationsInTimeRange`
        )}`}
        buttonText={`${t(
          `${translationsBase}.buttons.downloadApplicationsInTimeRange`
        )}`}
        isCompact={true}
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
            value={convertToUIDateFormat(formik.values.startDate)}
            onChange={(value) =>
              formik.setFieldValue(fields.startDate.name, value)
            }
          />
        </$GridCell>
        <$GridCell $colSpan={3}>
          <DateInput
            id={`${t(`${translationsBase}.fields.endDate`)}`}
            name={`${t(`${translationsBase}.fields.endDate`)}`}
            placeholder={`${t(`${translationsBase}.fields.endDate`)}`}
            value={convertToUIDateFormat(formik.values.endDate)}
            onChange={(value) =>
              formik.setFieldValue(
                fields.endDate.name,
                getCorrectEndDate(formik.values.startDate, value)
              )
            }
          />
        </$GridCell>
      </ReportsSection>
    </Container>
  );
};

export default ApplicationReports;
