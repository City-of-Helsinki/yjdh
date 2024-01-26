import AutoComplete from '../auto-complete';
import Subset from '../common/subset';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CompileTimeTypeTests = [
  // @ts-expect-error 'off' should not be combined with anything
  Subset<AutoComplete, 'off bday'>,
  // @ts-expect-error 'on' should not be combined with anything
  Subset<AutoComplete, 'on bday'>,
  // @ts-expect-error No trailing whitespace is allowed
  Subset<AutoComplete, 'on '>,
  // @ts-expect-error No leading whitespace is allowed
  Subset<AutoComplete, ' on'>,
  // @ts-expect-error No leading & trailing whitespace is allowed
  Subset<AutoComplete, ' on '>,
  // @ts-expect-error 'false' is not a valid autocomplete value
  Subset<AutoComplete, 'false'>,
  // @ts-expect-error 'true' is not a valid autocomplete value
  Subset<AutoComplete, 'true'>,
  // @ts-expect-error An empty string is not a valid autocomplete value
  Subset<AutoComplete, ''>,
  // @ts-expect-error '0' is not a valid autocomplete value
  Subset<AutoComplete, '0'>,
  // @ts-expect-error '1' is not a valid autocomplete value
  Subset<AutoComplete, '1'>,
  // @ts-expect-error 'offx' is not a valid autocomplete value
  Subset<AutoComplete, 'offx'>,
  // @ts-expect-error Wrong order of tokens ('home' & 'billing' should be swapped)
  Subset<AutoComplete, 'section-1 home billing tel-country-code webauthn'>,
  // On & Off
  Subset<AutoComplete, 'on'>,
  Subset<AutoComplete, 'off'>,
  // Autofill field names
  Subset<AutoComplete, 'name'>,
  Subset<AutoComplete, 'honorific-prefix'>,
  Subset<AutoComplete, 'given-name'>,
  Subset<AutoComplete, 'additional-name'>,
  Subset<AutoComplete, 'family-name'>,
  Subset<AutoComplete, 'honorific-suffix'>,
  Subset<AutoComplete, 'nickname'>,
  Subset<AutoComplete, 'username'>,
  Subset<AutoComplete, 'new-password'>,
  Subset<AutoComplete, 'current-password'>,
  Subset<AutoComplete, 'one-time-code'>,
  Subset<AutoComplete, 'organization-title'>,
  Subset<AutoComplete, 'organization'>,
  Subset<AutoComplete, 'street-address'>,
  Subset<AutoComplete, 'address-line1'>,
  Subset<AutoComplete, 'address-line2'>,
  Subset<AutoComplete, 'address-line3'>,
  Subset<AutoComplete, 'address-level4'>,
  Subset<AutoComplete, 'address-level3'>,
  Subset<AutoComplete, 'address-level2'>,
  Subset<AutoComplete, 'address-level1'>,
  Subset<AutoComplete, 'country'>,
  Subset<AutoComplete, 'country-name'>,
  Subset<AutoComplete, 'postal-code'>,
  Subset<AutoComplete, 'cc-name'>,
  Subset<AutoComplete, 'cc-given-name'>,
  Subset<AutoComplete, 'cc-additional-name'>,
  Subset<AutoComplete, 'cc-family-name'>,
  Subset<AutoComplete, 'cc-number'>,
  Subset<AutoComplete, 'cc-exp'>,
  Subset<AutoComplete, 'cc-exp-month'>,
  Subset<AutoComplete, 'cc-exp-year'>,
  Subset<AutoComplete, 'cc-csc'>,
  Subset<AutoComplete, 'cc-type'>,
  Subset<AutoComplete, 'transaction-currency'>,
  Subset<AutoComplete, 'transaction-amount'>,
  Subset<AutoComplete, 'language'>,
  Subset<AutoComplete, 'bday'>,
  Subset<AutoComplete, 'bday-day'>,
  Subset<AutoComplete, 'bday-month'>,
  Subset<AutoComplete, 'bday-year'>,
  Subset<AutoComplete, 'sex'>,
  Subset<AutoComplete, 'url'>,
  Subset<AutoComplete, 'photo'>,
  // Combinations of 2 tokens
  Subset<AutoComplete, 'shipping street-address'>,
  Subset<AutoComplete, 'shipping address-level2'>,
  Subset<AutoComplete, 'shipping postal-code'>,
  Subset<AutoComplete, 'shipping tel-local-prefix'>,
  Subset<AutoComplete, 'shipping tel-local-suffix'>,
  Subset<AutoComplete, 'current-password webauthn'>,
  // Combinations of 3 tokens
  Subset<AutoComplete, 'section-blue shipping street-address'>,
  Subset<AutoComplete, 'section-blue shipping address-level2'>,
  Subset<AutoComplete, 'section-blue shipping postal-code'>,
  Subset<AutoComplete, 'section-red shipping street-address'>,
  Subset<AutoComplete, 'section-red shipping address-level2'>,
  Subset<AutoComplete, 'section-red shipping postal-code'>,
  // Combinations of 4 tokens
  Subset<AutoComplete, 'section-payment billing work email'>,
  Subset<AutoComplete, 'section-contact shipping home tel'>,
  // Combinations of 5 tokens
  Subset<AutoComplete, 'section-1 billing home tel-country-code webauthn'>
];
