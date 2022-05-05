import TranslationsApi from '../../src/__tests__/types/translations';
import { DEFAULT_LANGUAGE, Language } from '../../src/i18n/i18n';
import PageComponent, { Options } from './PageComponent';

export type CommonTranslations = {
  appName: string;
  header: {
    loginLabel?: string;
    logoutLabel?: string;
    userAriaLabelPrefix?: string;
    languageMenuButtonAriaLabel: string;
  };
  languages: {
    fi: string;
    sv: string;
    en: string;
  };
};

abstract class TranslatedComponent<
  Translations extends CommonTranslations
> extends PageComponent {
  protected translations: Translations;

  protected constructor(
    translationsApi: TranslationsApi<Translations>,
    options?: Options
  ) {
    super(options?.datatestId);
    this.translations =
      translationsApi.translations[options?.lang ?? DEFAULT_LANGUAGE];
  }
}

export default TranslatedComponent;
