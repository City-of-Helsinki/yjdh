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

export default AutoComplete;
