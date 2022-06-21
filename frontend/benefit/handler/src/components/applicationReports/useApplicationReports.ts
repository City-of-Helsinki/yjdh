import {
  EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS,
  EXPORT_APPLICATIONS_ROUTES,
  PROPOSALS_FOR_DESISION,
} from 'benefit/handler/constants';
import useReportsApplicationBatchesQuery, {
  getReportsApplicationBatchesQueryKey,
} from 'benefit/handler/hooks/useReportsApplicationBatchesQuery';
import { ExportApplicationInTimeRangeFormProps } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import noop from 'lodash/noop';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { Field } from 'shared/components/forms/fields/types';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import ExportFileType from 'shared/types/export-file-type';
import {
  convertToBackendDateFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';
import { downloadFile } from 'shared/utils/file.utils';
import { DefaultTheme, useTheme } from 'styled-components';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  theme: DefaultTheme;
  language: Language;
  exportApplications: (
    type: ExportFileType,
    exportApplicationsRoute: string,
    proposalForDecision: PROPOSALS_FOR_DESISION
  ) => void;
  formik: FormikProps<ExportApplicationInTimeRangeFormProps>;
  fields: {
    [key in EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS]: Field<EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS>;
  };
  exportApplicationsInTimeRange: () => void;
  lastAcceptedApplicationsExportDate: string;
  lastRejectedApplicationsExportDate: string;
};

const useApplicationReports = (): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const { t } = useTranslation();
  const translationsBase = 'common:reports';

  const { axios, handleResponse } = useBackendAPI();

  const queryClient = useQueryClient();

  const { data: lastAcceptedApplicationBatches } =
    useReportsApplicationBatchesQuery(PROPOSALS_FOR_DESISION.ACCEPTED);
  const lastAcceptedApplicationsExportDate =
    lastAcceptedApplicationBatches && lastAcceptedApplicationBatches.length > 0
      ? convertToUIDateFormat(
          lastAcceptedApplicationBatches[
            lastAcceptedApplicationBatches.length - 1
          ].created_at
        )
      : '';

  const { data: lastRejectedApplicationBatches } =
    useReportsApplicationBatchesQuery(PROPOSALS_FOR_DESISION.REJECTED);
  const lastRejectedApplicationsExportDate =
    lastRejectedApplicationBatches && lastRejectedApplicationBatches.length > 0
      ? convertToUIDateFormat(
          lastRejectedApplicationBatches[
            lastRejectedApplicationBatches.length - 1
          ].created_at
        )
      : '';

  const exportApplications = useCallback(
    async (
      type: ExportFileType,
      exportApplicationsRoute: EXPORT_APPLICATIONS_ROUTES,
      proposalForDecision: PROPOSALS_FOR_DESISION
    ) => {
      console.log(
        `${BackendEndpoint.HANDLER_APPLICATIONS}${exportApplicationsRoute}_${type}/`
      );
      const data = await handleResponse<string>(
        axios.get(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${exportApplicationsRoute}_${type}/`,
          { responseType: 'arraybuffer' }
        )
      );
      downloadFile(data, type);
      void queryClient.invalidateQueries(
        getReportsApplicationBatchesQueryKey(proposalForDecision)
      );
    },
    [axios, handleResponse, queryClient]
  );

  const formik = useFormik<ExportApplicationInTimeRangeFormProps>({
    initialValues: {
      startDate: '',
      endDate: '',
    },
    onSubmit: noop,
  });

  const fields: ExtendedComponentProps['fields'] = React.useMemo(() => {
    const pairs = Object.values(
      EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS
    ).map<
      [
        EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS,
        Field<EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS>
      ]
    >((fieldName) => [
      fieldName,
      {
        name: fieldName,
        label: t(`common:calculators.fields.${fieldName}.label`),
        placeholder: t(`common:calculators.fields.${fieldName}.placeholder`),
      },
    ]);

    return fromPairs<Field<EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS>>(
      pairs
    ) as Record<
      EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS,
      Field<EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS>
    >;
  }, [t]);

  const { values } = formik;
  const { startDate, endDate } = values;

  const exportApplicationsInTimeRange = useCallback(async () => {
    const data = await handleResponse<string>(
      axios.get(
        `${BackendEndpoint.HANDLER_APPLICATIONS}${EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE}/`,
        {
          params: {
            handled_at_after: convertToBackendDateFormat(startDate),
            handled_at_before: convertToBackendDateFormat(endDate),
          },
        }
      )
    );
    downloadFile(data, 'csv');
  }, [handleResponse, axios, startDate, endDate]);

  return {
    t,
    translationsBase,
    theme,
    language,
    exportApplications,
    formik,
    fields,
    exportApplicationsInTimeRange,
    lastAcceptedApplicationsExportDate,
    lastRejectedApplicationsExportDate,
  };
};

export { useApplicationReports };
