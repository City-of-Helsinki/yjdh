import Subset from './common/subset';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type Rank = 'primary' | 'secondary' | 'tertiary' | 'fallback';

type Level = 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'emergency';

/**
 * Color type to make examples from HTML specification work, e.g. "section-blue",
 * see examples in HTML specification:
 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
 */
type Color =
  | 'black'
  | 'blue'
  | 'brown'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'white'
  | 'yellow';

type Direction = 'up' | 'down' | 'left' | 'right';

type Position =
  | 'top'
  | 'bottom'
  | 'center'
  | 'left'
  | 'right'
  | 'first'
  | 'last'
  | 'middle'
  | 'start'
  | 'end'
  | 'header'
  | 'column'
  | 'row'
  | 'table'
  | 'footer'
  | 'side';

type Context =
  | 'local'
  | 'global'
  | 'internal'
  | 'external'
  | 'personal'
  | 'home'
  | 'work';

type ActionVerb =
  | 'add'
  | 'remove'
  | 'delete'
  | 'create'
  | 'update'
  | 'modify'
  | 'accept'
  | 'reject'
  | 'forbid'
  | 'deny'
  | 'confirm'
  | 'notify'
  | 'register'
  | 'search';

type ActionNoun =
  | 'application'
  | 'confirmation'
  | 'login'
  | 'notification'
  | 'registration';

type Age = 'adult' | 'child' | 'senior' | 'youth' | 'new' | 'old';

type Role =
  | 'guardian'
  | 'parent'
  | 'employee'
  | 'employer'
  | 'applicant'
  | 'handler'
  | 'recipient'
  | 'sender'
  | 'admin'
  | 'administrator'
  | 'superuser'
  | 'user';

type ContactPerson =
  | 'contact-person'
  | 'employee-contact-person'
  | 'employer-contact-person'
  | 'applicant-contact-person';

type ContactInfo =
  | 'contact-info'
  | 'employee-contact-info'
  | 'employer-contact-info'
  | 'applicant-contact-info';

type YjdhRelatedWords =
  | 'ahjo'
  | 'dvv'
  | 'helsinki-profile'
  | 'talpa'
  | 'vtj'
  | 'ytj';

type MiscellaneousNouns =
  | 'chat'
  | 'city'
  | 'company'
  | 'contact'
  | 'department'
  | 'event'
  | 'feedback'
  | 'group'
  | 'hobby'
  | 'invoice'
  | 'location'
  | 'message'
  | 'organization'
  | 'other'
  | 'payment'
  | 'profile'
  | 'queue'
  | 'sport'
  | 'team'
  | 'ticket'
  | 'venue'
  | 'voucher';

/**
 * Arbitrary selection of section named groups.
 *
 * @note HTML specification allows for any named groups but that doesn't easily
 * translate to string literal types so hardcoding an arbitrary selection of
 * supported named group for sections, e.g. "section-9" or "section-info".
 */
type SectionNamedGroup =
  | Digit
  | Rank
  | ActionVerb
  | ActionNoun
  | Color
  | Direction
  | Position
  | Level
  | Age
  | Role
  | ContactPerson
  | ContactInfo
  | Context
  | YjdhRelatedWords
  | MiscellaneousNouns;

type SectionToken = `section-${SectionNamedGroup}`;

type BillingShippingToken = 'billing' | 'shipping';

type AutofillFieldToken =
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'one-time-code'
  | 'organization-title'
  | 'organization'
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level4'
  | 'address-level3'
  | 'address-level2'
  | 'address-level1'
  | 'country'
  | 'country-name'
  | 'postal-code'
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type'
  | 'transaction-currency'
  | 'transaction-amount'
  | 'language'
  | 'bday'
  | 'bday-day'
  | 'bday-month'
  | 'bday-year'
  | 'sex'
  | 'url'
  | 'photo';

type ContactInfoCategoryToken = 'home' | 'work' | 'mobile' | 'fax' | 'pager';

type ContactInfoWithoutCategoryToken =
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-local-prefix'
  | 'tel-local-suffix'
  | 'tel-extension'
  | 'email'
  | 'impp';

type ContactInfoWithCategoryToken =
  `${ContactInfoCategoryToken} ${ContactInfoWithoutCategoryToken}`;

type WebAuthenticationToken = 'webauthn';

type OnOff = 'on' | 'off';

/**
 * Makes input string literal union type optional and
 * usable as prefix token in a set of space-separated tokens.
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
 * @example OptionalPrefix<'a' | 'b'> == '' | 'a ' | 'b ';
 */
type OptionalPrefix<T> = '' | `${T} `;

/**
 * Makes input string literal union type optional and
 * usable as suffix token in a set of space-separated tokens.
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#space-separated-tokens
 * @example OptionalSuffix<'a' | 'b'> == '' | ' a' | ' b';
 */
type OptionalSuffix<T> = '' | ` ${T}`;

type AutofillDetailTokens =
  | `${OptionalPrefix<SectionToken>}${OptionalPrefix<BillingShippingToken>}${
      | AutofillFieldToken
      | ContactInfoWithoutCategoryToken
      | ContactInfoWithCategoryToken}${OptionalSuffix<WebAuthenticationToken>}`;

/**
 * Type for autoComplete property in React (i.e. autocomplete attribute in HTML)
 *
 * Caveats:
 *  - Not exact (i.e. allows combinations not allowed by HTML specification)
 *    - e.g. "name address-line1" is allowed here but should not be
 *    - "inappropriate for a control" clause in HTML specification is not handled,
 *      which means that this type allows all combinations for all control groups,
 *      i.e. for Date, Month, Multiline, Numeric, Password, Tel, Text, URL and Username.
 *  - Not complete (i.e. does not allow all combinations allowed by HTML specification)
 *    - e.g. "section-arbitrary-named-group-name-123" is not allowed here but should be
 *
 * @see https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill
 */
type AutoComplete = OnOff | AutofillDetailTokens;

// Compile-time tests for AutoComplete type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AutoCompleteTests = [
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

export default AutoComplete;
