import { t } from 'testcafe';

import ApplicantPageComponent from './ApplicantPageComponent';

class MainIngress extends ApplicantPageComponent {
  public constructor() {
    super({ datatestId: 'main-ingress' });
  }

  newApplicationButton = this.component.findByRole('button', {
    name: this.translations.mainIngress.newApplicationBtnText,
  });

  public async clickCreateNewApplicationButton(): Promise<void> {
    return t.click(this.newApplicationButton);
  }
}

export default MainIngress;
