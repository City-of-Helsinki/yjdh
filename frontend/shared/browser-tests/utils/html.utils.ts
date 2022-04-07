import { ClientFunction } from 'testcafe';

/**
 * enforce click html element when t.click doesn't work
 * https://github.com/DevExpress/testcafe/issues/4146#issuecomment-521216775
 * @param cssSelector
 */
export const htmlElementClick: ClientFunction = ClientFunction(
  (cssSelector: string) =>
    document.querySelector<HTMLElement>(cssSelector)?.click()
);
