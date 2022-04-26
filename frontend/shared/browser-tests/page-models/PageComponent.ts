import { WithinSelectors } from '@testing-library/testcafe';
import { t } from 'testcafe';

import { TranslationsApi } from '../../src/__tests__/types/translations';
import {
  containsRegexp,
  replaceValues,
} from '../../src/__tests__/utils/translation-utils';
import { MAIN_CONTENT_ID } from '../../src/constants';
import { DEFAULT_LANGUAGE, Language } from '../../src/i18n/i18n';
import {
  getErrorMessage,
  screenContext,
  withinContext,
} from '../utils/testcafe.utils';

type Options = {
  datatestId?: string;
  lang?: Language;
};

abstract class PageComponent<Translations> {
  protected dataTestId: string;

  protected lang: Language;

  protected translations!: Translations;

  protected component: WithinSelectors;

  protected screen = screenContext(t);

  protected within = withinContext(t);

  protected regexp = containsRegexp;

  protected replaced = replaceValues;

  protected abstract getTranslationsApi(): TranslationsApi<Translations>;

  protected constructor(options?: Options) {
    this.dataTestId = options?.datatestId ?? MAIN_CONTENT_ID;
    this.component = this.within(this.screen.getByTestId(this.dataTestId));
    this.lang = options?.lang ?? DEFAULT_LANGUAGE;
    this.setTranslations(this.lang);
  }

  public setTranslations(lang: Language): void {
    const {
      translations: { [lang]: translations },
    } = this.getTranslationsApi();
    this.translations = translations;
  }

  loadingSpinners = this.screen.queryAllByTestId('hidden-loading-indicator');

  public async isLoadingSpinnerNoMorePresent(): Promise<void> {
    await t.expect(this.loadingSpinners.exists).notOk(await getErrorMessage(t));
  }

  /**
   * Waits until component is loaded to the screen. Please call this instantly after
   * calling the constructor to make sure the component is present before proceeding with other actions
   */
  public async isLoaded(): Promise<void> {
    await this.isLoadingSpinnerNoMorePresent();
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await t
      .expect(this.screen.findByTestId(this.dataTestId).exists)
      .ok(await getErrorMessage(t));
  }
}

export default PageComponent;
