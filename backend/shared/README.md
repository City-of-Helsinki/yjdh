<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [YJDH Backend Shared Component](#yjdh-backend-shared-component)
  - [Suomi.fi authentication (suomi_fi)](#suomifi-authentication-suomi_fi)
    - [Configuration](#configuration)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# YJDH Backend Shared Component


## Suomi.fi authentication (suomi_fi)

Production IDP metadata was refreshed from the Suomi.fi notice published on
2026-05-05:
[news](https://kehittajille.suomi.fi/topical/certificates-used-for-signing-suomi-fi-e-identification-saml-messages-will-change-in-april-may-2026)
"Certificates used for signing Suomi.fi e-Identification SAML messages will change in April-May 2026".

IDP metadata files are originally downloaded from:
- Suomi.fi production IDP metadata https://tunnistus.suomi.fi/static/metadata/idp-metadata.xml →
  [idp-metadata-tunnistautuminen.xml](./shared/suomi_fi/metadata/idp-metadata-tunnistautuminen.xml)
- Suomi.fi test IDP metadata https://static.apro.tunnistus.fi/static/metadata/idp-metadata-secondary.xml →
  [idp-metadata-secondary.xml](./shared/suomi_fi/metadata/idp-metadata-secondary.xml)

For contact persons Suomi.fi authentication requires at least a technical contact.

### Configuration
- `NEXT_PUBLIC_BACKEND_URL` Required for SAML metadata configuration
- `NEXT_PUBLIC_ENABLE_SUOMIFI` Enable Suomi.fi auth
- `SUOMIFI_TEST` Use Suomi.fi test IDP
- `SUOMIFI_SERVICE_NAME_EXTRA` Extra string to attach to the `ServiceName`
- `SUOMIFI_TECHNICAL_FIRST_NAME`
- `SUOMIFI_TECHNICAL_LAST_NAME`
- `SUOMIFI_TECHNICAL_EMAIL`
- `SUOMIFI_SUPPORT_FIRST_NAME`
- `SUOMIFI_SUPPORT_LAST_NAME`
- `SUOMIFI_SUPPORT_EMAIL`
- `SUOMIFI_ADMINISTRATIVE_FIRST_NAME`
- `SUOMIFI_ADMINISTRATIVE_LAST_NAME`
- `SUOMIFI_ADMINISTRATIVE_EMAIL`
- `SUOMIFI_CERT` base64 encoded public key certificate (e.g. base64 -w 0 public.pem)
- `SUOMIFI_KEY` base64 encoded private key (e.g. base64 -w 0 private.key)
