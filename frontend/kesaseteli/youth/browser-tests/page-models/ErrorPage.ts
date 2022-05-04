import YouthPageComponent from './YouthPageComponent';

class ErrorPage extends YouthPageComponent {
  public constructor() {
    super();
  }

  private readonly heading = this.component.findByRole('heading', {
    name: this.translations.errorPage.title,
  });

  public async isLoaded(): Promise<void> {
    await super.isLoaded();
    return ErrorPage.expect(this.heading);
  }
}

export default ErrorPage;
