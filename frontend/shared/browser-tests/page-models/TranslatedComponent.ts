import PageComponent from 'shared/page-models/PageComponent';

import { TranslationsApi } from '../../src/__tests__/types/translations';
import { DEFAULT_LANGUAGE, Language } from '../../src/i18n/i18n';

export type Options = {
  datatestId?: string;
  lang?: Language;
};

abstract class TranslatedComponent<Translations> extends PageComponent {
  protected lang: Language;

  protected translations!: Translations;

  protected abstract getTranslationsApi(): TranslationsApi<Translations>;

  protected constructor(options?: Options) {
    super(options?.datatestId);
    this.lang = options?.lang ?? DEFAULT_LANGUAGE;
    this.setTranslations(this.lang);
  }

  public setTranslations(lang: Language): void {
    const {
      translations: { [lang]: translations },
    } = this.getTranslationsApi();
    this.translations = translations;
  }
}

export default TranslatedComponent;
