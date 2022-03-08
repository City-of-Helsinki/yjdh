import {
  EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS,
  EXPORT_APPLICATIONS_ROUTES,
} from 'benefit/handler/constants';
import { ExportApplicationInTimeRangeFormProps } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { FormikProps, useFormik } from 'formik';
import fromPairs from 'lodash/fromPairs';
import { TFunction } from 'next-i18next';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'shared/components/forms/fields/types';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';
import { downloadCSVFile } from 'shared/utils/file.utils';
import { DefaultTheme, useTheme } from 'styled-components';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  theme: DefaultTheme;
  language: Language;
  exportApplications: (
    exportApplicationsRoute: EXPORT_APPLICATIONS_ROUTES
  ) => void;
  formik: FormikProps<ExportApplicationInTimeRangeFormProps>;
  fields: {
    [key in EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS]: Field<EXPORT_APPLICATIONS_IN_TIME_RANGE_FORM_KEYS>;
  };
  exportApplicationsInTimeRange: () => void;
};

const useApplicationReports = (): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const { t } = useTranslation();
  const translationsBase = 'common:reports';

  const { axios, handleResponse } = useBackendAPI();

  const exportApplications = useCallback(
    async (exportApplicationsRoute: EXPORT_APPLICATIONS_ROUTES) => {
      const data = await handleResponse<string>(
        axios.get(
          `${BackendEndpoint.HANDLER_APPLICATIONS}${exportApplicationsRoute}/`
        )
      );
      downloadCSVFile(data);
    },
    [axios, handleResponse]
  );

  const formik = useFormik<ExportApplicationInTimeRangeFormProps>({
    initialValues: {
      startDate: '',
      endDate: '',
    },
    onSubmit: () =>
      exportApplications(EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE),
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
    downloadCSVFile(data);
  }, [axios, handleResponse, startDate, endDate]);

  return {
    t,
    translationsBase,
    theme,
    language,
    exportApplications,
    formik,
    fields,
    exportApplicationsInTimeRange,
  };
};

export { useApplicationReports };
