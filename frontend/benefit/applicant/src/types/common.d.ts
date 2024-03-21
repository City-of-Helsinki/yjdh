import { Application } from 'benefit-shared/types/application';

export type DynamicFormStepComponentProps = {
  data: Application;
};

interface Loading {
  isLoading: true;
}

interface ErrorResponse {
  response: {
    status: number;
    data: ErrorData;
  };
}

interface ErrorData {
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

type RNSData = {
  apiKey: string;
  title: string;
  canonicalUrl: string;
  disableFonts?: boolean;
};

export type ConsentsCookie = {
  'city-of-helsinki-cookie-consents': boolean;
  rns: boolean;
  rnsbid_ts: boolean;
  rns_reaction: boolean;
};

declare global {
  interface Window {
    rnsData: RNSData;
  }
}
