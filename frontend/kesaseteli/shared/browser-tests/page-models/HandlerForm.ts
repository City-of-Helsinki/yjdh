import PageComponent from '@frontend/shared/browser-tests/page-models/PageComponent';
import {
  getErrorMessage,
  setDataToPrintOnFailure,
} from '@frontend/shared/browser-tests/utils/testcafe.utils';
import { t } from 'testcafe';

import ActivatedYouthApplication from '../../src/types/activated-youth-application';

export default class HandlerForm<
  A extends ActivatedYouthApplication
> extends PageComponent {
  private expectedApplication?: A;

  public constructor(expectedApplication?: A) {
    super('handler-form');
    this.expectedApplication = expectedApplication;
  }

  private title = this.component.findByRole('heading', {
    name: /hakemuksen tiedot/i,
  });

  private notFound = this.component.findByRole('heading', {
    name: /hakemusta ei löytynyt/i,
  });

  private applicationField(id: keyof A | 'name') {
    return this.component.findByTestId(`handlerApplication-${id as string}`);
  }

  private acceptButton = this.component.findByRole('button', {
    name: /hyväksy/i,
  });

  private rejectButton = this.component.findByRole('button', {
    name: /hylkää/i,
  });

  private confirmDialog = this.screen.findByRole('dialog');

  private confirmAcceptButton = this.within(this.confirmDialog).findByRole(
    'button',
    {
      name: /hyväksy/i,
    }
  );

  private confirmRejectButton = this.within(this.confirmDialog).findByRole(
    'button',
    {
      name: /hylkää/i,
    }
  );

  private notYetActivated = this.component.findByRole('heading', {
    name: /nuori ei ole vielä aktivoinut hakemusta/i,
  });

  private additionalInfoRequested = this.component.findByRole('heading', {
    name: /nuori ei ole vielä täyttänyt lisätietohakemusta/i,
  });

  private isAccepted = this.component.findByRole('heading', {
    name: /hyväksytty/i,
  });

  private isRejected = this.component.findByRole('heading', {
    name: /hylätty/i,
  });

  public applicantIsNotInTargetGroup(age: number) {
    return this.expect(
      this.component.findByText(
        this.regexp(
          `henkilö ei kuulu iän puolesta kohderyhmään (${age}-vuotias)`
        )
      )
    );
  }

  public applicantsLastnameMismatches() {
    return this.expect(
      this.component.findByText(
        `Sukunimi poikkeaa hakemukselle syötetystä sukunimestä (Väärä sukunimi)`
      )
    );
  }

  public applicantsPostcodeMismatches(postcode: string) {
    return this.expect(
      this.component.findByText(
        this.regexp(
          `Postikoodi poikkeaa hakemukselle syötetystä postikoodista (${postcode})`
        )
      )
    );
  }

  public applicantLivesOutsideHelsinki() {
    return this.expect(this.component.findByText('Henkilö ei asu Helsingissä'));
  }

  public async applicationNotFound() {
    return this.expect(this.notFound);
  }

  public async applicationFieldHasValue(
    key: keyof A | 'name',
    expectedValue?: string
  ) {
    if (!expectedValue && !this.expectedApplication) {
      throw new Error('you need either expected application or value to test');
    }
    const value = expectedValue ?? this.expectedApplication?.[key as keyof A];
    setDataToPrintOnFailure(t, String(key), value);
    return t
      .expect(this.applicationField(key).textContent)
      .contains(value as string, await getErrorMessage(t));
  }

  applicationIsNotYetActivated() {
    return this.expect(this.notYetActivated);
  }

  additionalInformationRequested() {
    return this.expect(this.additionalInfoRequested);
  }

  confirmationDialogIsPresent() {
    return this.expect(this.confirmDialog);
  }

  applicationIsAccepted() {
    return this.expect(this.isAccepted);
  }

  applicationIsRejected() {
    return this.expect(this.isRejected);
  }

  public async clickAcceptButton() {
    return t.click(this.acceptButton);
  }

  public async clickConfirmAcceptButton() {
    return t.click(this.confirmAcceptButton);
  }

  public async clickRejectButton() {
    return t.click(this.rejectButton);
  }

  public async clickConfirmRejectButton() {
    return t.click(this.confirmRejectButton);
  }

  public async acceptApplication() {
    await this.isLoaded();
    await this.clickAcceptButton();
    await this.confirmationDialogIsPresent();
    await this.clickConfirmAcceptButton();
    await this.applicationIsAccepted();
  }

  public async rejectApplication() {
    await this.isLoaded();
    await this.clickRejectButton();
    await this.confirmationDialogIsPresent();
    await this.clickConfirmRejectButton();
    await this.applicationIsRejected();
  }
}
