import { TFunction } from 'next-i18next';
import { useTranslation } from 'react-i18next';
import useLocale from 'shared/hooks/useLocale';
import { Language } from 'shared/i18n/i18n';
import { DefaultTheme, useTheme } from 'styled-components';
import { Dispatch, SetStateAction, useState, useCallback } from 'react';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { EXPORT_APPLICATIONS_ROUTES } from 'benefit/handler/constants';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { convertToBackendDateFormat } from 'shared/utils/date.utils';

type ExtendedComponentProps = {
  t: TFunction;
  translationsBase: string;
  theme: DefaultTheme;
  language: Language;
  startDate?: string | undefined;
  endDate?: string | undefined;
  setStartDate: Dispatch<SetStateAction<string>>;
  setEndDate: Dispatch<SetStateAction<string>>;
  exportApplication: (
    exportApplicationRoute: EXPORT_APPLICATIONS_ROUTES
  ) => void;
};

const useApplicationReports = (): ExtendedComponentProps => {
  const language = useLocale();
  const theme = useTheme();
  const { t } = useTranslation();
  const translationsBase = 'common:reports';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { axios } = useBackendAPI();

  const exportApplication = useCallback(
    (exportApplicationRoute: EXPORT_APPLICATIONS_ROUTES): void => {
      if (exportApplicationRoute === EXPORT_APPLICATIONS_ROUTES.IN_TIME_RANGE) {
        console.log('');
        if (startDate && endDate)
          axios
            .get(
              `${
                BackendEndpoint.HANDLER_APPLICATIONS
              }${exportApplicationRoute}/?handled_at_after=${convertToBackendDateFormat(
                startDate
              )}&handled_at_before=${convertToBackendDateFormat(endDate)}`
            )
            .then((response) => {
              if (response.status === 200 && response.data)
                window.open(`data:text/csv;charset=utf-8,${response.data}`);
            });
      } else
        axios
          .get(
            `${BackendEndpoint.HANDLER_APPLICATIONS}${exportApplicationRoute}/`
          )
          .then((response) => {
            if (response.status === 200 && response.data)
              window.open(`data:text/csv;charset=utf-8,${response.data}`);
          });
    },
    []
  );

  return {
    t,
    translationsBase,
    theme,
    language,
    setStartDate,
    setEndDate,
    exportApplication,
  };
};

export { useApplicationReports };
