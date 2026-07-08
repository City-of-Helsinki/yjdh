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

const getAgeFromSsn = (ssn?: string): number => {
  if (!ssn || ssn.length < 7) {
    return 16;
  }
  let year = parseInt(ssn.slice(4, 6), 10);
  const separator = ssn.charAt(6).toUpperCase();
  if (separator === '+') {
    year += 1800;
  } else if (['A', 'B', 'C', 'D', 'E', 'F'].includes(separator)) {
    year += 2000;
  } else {
    year += 1900;
  }
  const currentYear = new Date().getFullYear();
  return currentYear - year;
};

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

  private schoolsDropdown = this.component.findByRole('button', {
    name: this.regexp(this.translations.youthApplication.form.selectedSchool),
  });

  private schoolsFilterInput = this.component.findByRole('combobox', {
    name: this.regexp(
      this.translations.youthApplication.form.schoolsFilterLabel
    ),
  });

  private school(schoolName: string): SelectorPromise {
    return this.component.findByRole('option', { name: schoolName });
  }

  private checkbox(name: CheckboxName): SelectorPromise {
    return this.component.findByRole('checkbox', {
      name: this.regexp(this.translations.youthApplication.form[name]),
    });
  }

  private targetGroupRadioButton(targetGroupId: string): SelectorPromise {
    return this.component.findByTestId(`target_group-${targetGroupId}`);
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
    await t.click(this.schoolsDropdown);
    await this.fillInput(this.schoolsFilterInput, schoolName);
    return t.click(this.school(schoolName));
  }

  public toggleCheckbox(name: CheckboxName): TestControllerPromise {
    return t.click(this.checkbox(name));
  }

  public selectTargetGroup(ssn?: string): TestControllerPromise {
    const age = getAgeFromSsn(ssn);
    const index = age === 17 ? 1 : 0;
    const radioInput = this.component.findAllByRole('radio').nth(index);
    return this.clickSelectRadioButton(radioInput.parent().find('label'));
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
    await this.typeInput('postcode', application.postcode);
    if (application.is_unlisted_school) {
      await this.toggleCheckbox('is_unlisted_school');
      await this.typeInput('unlistedSchool', application.school);
    } else {
      await this.typeAndSelectSchoolFromDropdown(application.school ?? '');
    }
    await this.typeInput('phone_number', application.phone_number);
    await this.typeInput('email', application.email);
    await this.selectTargetGroup(application.social_security_number);
    await this.toggleCheckbox('termsAndConditions');
    return this.clickSendButton();
  }
}

export default YouthForm;
