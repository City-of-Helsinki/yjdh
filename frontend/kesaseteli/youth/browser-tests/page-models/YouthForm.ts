import YouthApplication from '@frontend/kesaseteli-shared/src/types/youth-application';
import YouthFormData from '@frontend/kesaseteli-shared/src/types/youth-form-data';
import { Language } from '@frontend/shared/src/i18n/i18n';
import { t } from 'testcafe';

import YouthPageComponent from './YouthPageComponent';

type TextInputName = keyof Omit<
  YouthFormData,
  'selectedSchool' | 'is_unlisted_school' | 'termsAndConditions'
>;

type CheckboxName = keyof Pick<
  YouthFormData,
  'is_unlisted_school' | 'termsAndConditions'
>;

class YouthForm extends YouthPageComponent {
  public constructor(lang?: Language) {
    super({ datatestId: 'youth-form', lang });
  }

  private textInput(name: TextInputName): SelectorPromise {
    return this.component.findByTestId(name as string);
  }

  private schoolsLoading = this.component.queryByPlaceholderText(
    this.translations.youthApplication.form.schoolsLoading
  );

  private schoolsDropdown = this.component.findByRole('combobox', {
    name: this.regexp(this.translations.youthApplication.form.schoolsDropdown),
  });

  private school(schoolName: string): SelectorPromise {
    return this.component.findByRole('option', { name: schoolName });
  }

  private checkbox(name: CheckboxName): SelectorPromise {
    return this.component.findByRole('checkbox', {
      name: this.regexp(this.translations.youthApplication.form[name]),
    });
  }

  private sendButton = this.component.findByRole('button', {
    name: this.translations.youthApplication.form.sendButton,
  });

  private checkNotification = this.component.findByRole('heading', {
    name: this.translations.youthApplication.checkNotification.label,
  });

  private sendAnywayLink = this.within(
    this.component.findByText(
      this.translations.youthApplication.form.sendItAnyway
    )
  ).findByRole('button', {
    name: this.translations.youthApplication.form.forceSubmitLink,
  });

  public async isLoaded(): Promise<void> {
    await super.isLoaded();
    return this.expectNotPresent(this.schoolsLoading);
  }

  public showsCheckNotification(): Promise<void> {
    return this.expect(this.checkNotification);
  }

  public typeInput(name: TextInputName, value?: string): TestControllerPromise {
    return this.fillInput(this.textInput(name), value);
  }

  public async typeAndSelectSchoolFromDropdown(
    schoolName: string
  ): Promise<TestControllerPromise> {
    await this.fillInput(this.schoolsDropdown, schoolName);
    return t.click(this.school(schoolName));
  }

  public toggleCheckbox(name: CheckboxName): TestControllerPromise {
    return t.click(this.checkbox(name));
  }

  public clickSendButton(): TestControllerPromise {
    return t.click(this.sendButton);
  }

  public clickSendItAnywayLink(): TestControllerPromise {
    return t.click(this.sendAnywayLink);
  }

  public async sendYouthApplication(
    application: YouthApplication
  ): Promise<TestControllerPromise> {
    await this.isLoaded();
    await this.typeInput('first_name', application.first_name);
    await this.typeInput('last_name', application.last_name);
    await this.typeInput(
      'social_security_number',
      application.social_security_number
    );
    await this.typeAndSelectSchoolFromDropdown(application.school ?? '');
    await this.typeInput('postcode', application.postcode);
    if (application.is_unlisted_school) {
      await this.toggleCheckbox('is_unlisted_school');
      await this.typeInput('unlistedSchool', application.school);
    }
    await this.typeInput('phone_number', application.phone_number);
    await this.typeInput('email', application.email);
    await this.toggleCheckbox('termsAndConditions');
    return this.clickSendButton();
  }
}

export default YouthForm;
