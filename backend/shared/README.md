# YJDH Backend Shared Component


## Suomi.fi authentication (suomi_fi)

IDP metadata files are originally downloaded from:
- Suomi.fi production IDP metadata https://tunnistus.suomi.fi/static/metadata/idp-metadata-tunnistautuminen.xml
- Suomi.fi test IDP metadata
  https://testi.apro.tunnistus.fi/static/metadata/idp-metadata-secondary.xml

For contact persons Suomi.fi authentication requires at least a technical contact.

### Configuration
- `NEXT_PUBLIC_BACKEND_URL` Required for SAML metadata configuration
- `ENABLE_SUOMIFI` Enable Suomi.fi auth
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
