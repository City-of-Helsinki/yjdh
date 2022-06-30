# TET Job Search

Local development is usually easiest when setting `NEXT_PUBLIC_MOCK_FLAG=1`.
It mocks authentication but not Linked Events, so you still need to set `LINKEDEVENTS_URL` and `LINKEDEVENTS_API_KEY`.

The mock flag doesn't check authorization, so it's always a good idea to test with `NEXT_PUBLIC_MOCK_FLAG=0` as well to verify that the requests actually work.

The OIDC (suomi.fi) authentication as a nice test setup that works from localhost. For this you need to define variables that are not set in `.env.tet.example`:

```bash
OIDC_RP_CLIENT_ID=
OIDC_RP_CLIENT_SECRET=
EAUTHORIZATIONS_CLIENT_ID=
EAUTHORIZATIONS_CLIENT_SECRET=
EAUTHORIZATIONS_API_OAUTH_SECRET=
```
