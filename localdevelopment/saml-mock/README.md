<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Local SAML 2.0 Identity Provider (IdP) Mock](#local-saml-20-identity-provider-idp-mock)
  - [Why this mock exists](#why-this-mock-exists)
  - [1. Running the Mock IdP](#1-running-the-mock-idp)
  - [2. Configuring the Backend (e.g., Kesäseteli)](#2-configuring-the-backend-eg-kes%C3%A4seteli)
    - [Step 1: Generate Local Certificates](#step-1-generate-local-certificates)
    - [Step 2: Download the Mock IdP Metadata XML](#step-2-download-the-mock-idp-metadata-xml)
    - [Step 3: Map the Metadata in `local_settings.py`](#step-3-map-the-metadata-in-local_settingspy)
  - [3. Testing Login and Logout Flows](#3-testing-login-and-logout-flows)
    - [Step 1: Trust the Self-Signed Certificates in your browser (CRITICAL)](#step-1-trust-the-self-signed-certificates-in-your-browser-critical)
    - [Step 2: Test the Flow](#step-2-test-the-flow)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Local SAML 2.0 Identity Provider (IdP) Mock

This folder contains configurations to run a local mock SAML 2.0 Identity Provider (IdP) using `kristophjunge/test-saml-idp` (based on SimpleSAMLphp).

## Why this mock exists

1. **Test Real SAML protocol**: The default `NEXT_PUBLIC_MOCK_FLAG=true` bypasses SAML entirely and uses mock OIDC endpoints to simulate logins. This mock allows testing the real `djangosaml2` / `pysaml2` pathway locally (including XML signing, encryption, assertion parsing, and metadata validation).
2. **Troubleshoot Single Logout (SLO)**: Testing SAML Single Logout requires a two-way redirect/post handshake between the SP (your Django app) and the IdP. The official Suomi.fi test environment (`testi.apro.tunnistus.fi`) will not trust or redirect back to `localhost` URLs.
3. **Suomi.fi Simulation**: The mock is configured to return the exact Finnish national identity attributes (OIDs) that the Suomi.fi integration expects.

---

## 1. Running the Mock IdP

To spin up the mock IdP server in the background, run the following command from the repository root:

```bash
docker compose -f compose/saml-mock.yml up -d
```

To stop it:
```bash
docker compose -f compose/saml-mock.yml down
```

The mock IdP runs on:
*   HTTP: `http://localhost:8080/simplesaml/`
*   HTTPS: `https://localhost:8443/simplesaml/` (Default login credentials: `samluser` / `samlpassword`)

---

## 2. Configuring the Backend (e.g., Kesäseteli)

To configure the Django backend to connect to this mock IdP:

### Step 1: Generate Local Certificates
Suomi.fi requires signed SAML messages. Generate a self-signed certificate pair for your local Service Provider (SP):

```bash
openssl req -newkey rsa:3072 -new -x509 -days 3652 -nodes -out saml.crt -keyout saml.key
```

Base64 encode the keys so they can be injected into the backend `.env` variables:
```bash
# On macOS
base64 -i saml.crt -o saml.crt.b64
base64 -i saml.key -o saml.key.b64
```

Copy the outputs and add them to your local environment file (e.g. `.env.kesaseteli-backend`):
```env
NEXT_PUBLIC_ENABLE_SUOMIFI=True
SUOMIFI_TEST=True
SUOMIFI_CERT="<content of saml.crt.b64>"
SUOMIFI_KEY="<content of saml.key.b64>"
```

### Step 2: Download the Mock IdP Metadata XML
The Django backend needs to parse the IdP's metadata XML to resolve endpoints and public certificates. Download it directly from the running container:

```bash
curl -k -o backend/shared/shared/suomi_fi/metadata/mock-idp-metadata.xml https://localhost:8443/simplesaml/saml2/idp/metadata.php
```

### Step 3: Map the Metadata in `local_settings.py`
Create a `local_settings.py` file in `backend/kesaseteli/` (this file is ignored by Git, ensuring you don't commit development configurations):

```python
import os

# Point djangosaml2 to our local mock metadata XML
MOCK_METADATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "shared/shared/suomi_fi/metadata/mock-idp-metadata.xml"
)

if os.path.exists(MOCK_METADATA_PATH):
    SAML_CONFIG["metadata"] = {
        "local": [MOCK_METADATA_PATH],
    }

# Keep Authn and Logout requests/responses signed to match Suomi.fi security settings
SAML_CONFIG["service"]["sp"]["authn_requests_signed"] = True
SAML_CONFIG["service"]["sp"]["logout_requests_signed"] = True
SAML_CONFIG["service"]["sp"]["logout_responses_signed"] = True
```

---

## 3. Testing Login and Logout Flows

### Step 1: Trust the Self-Signed Certificates in your browser (CRITICAL)
Because both the Django SP and the mock IdP run on self-signed certificates locally, your browser will block cookies and redirects between them unless you explicitly trust both:
1.  Open your browser and navigate to the mock IdP: `https://localhost:8443/simplesaml/`.
2.  Click **Advanced -> Proceed to localhost (unsafe)**.
3.  Do the same for your local backend: `https://localhost:8000/admin/`.

*If you skip this step, the browser will refuse to set/send the `SameSite=None; Secure` cookies during cross-origin redirections, and Single Logout (SLO) will fail.*

### Step 2: Test the Flow
1.  Start your application stack (e.g. `yarn employer:up`).
2.  Go to the employer frontend and click Login. You will be redirected to the mock IdP page at `https://localhost:8443`.
3.  Log in using:
    *   **Username**: `samluser`
    *   **Password**: `samlpassword`
4.  Once redirected back and logged in, click **Logout**.
5.  Watch the redirects in the network tab:
    *   The frontend redirects to `/saml2/logout/`.
    *   The Django SP redirects to `https://localhost:8443/...` (IdP SingleLogoutService).
    *   The IdP clears the session and redirects back to `https://localhost:8000/saml2/ls/`.
    *   Django receives the callback, logs you out locally, and redirects you back to the employer UI root.
