# Kesäseteli application endpoints

## Application Environment Links

> **WARNING:** This configurations can easily change by time! Please check the Openshift console or Azure DevOps for the latest configuration.

URL endpoints for each environment listed in https://helsinkisolutionoffice.atlassian.net/wiki/spaces/platta/pages/7339999722/Kes+seteli+-+Application+Information+Document+AID and Openshift https://console-openshift-console.apps.arodevtest.hel.fi/topology/ns/hki-kanslia-yjdh-kesaseteli-dev.

> These URLs are tested that they respond 23.1.2026.

### Employer frontend

Employers use this UI to make a benefit application for Youths who they have employed with a summer voucher.

* **DEV:** https://kesaseteli.dev.hel.ninja/
* **TEST:** https://yjdh-kesaseteli-ui-test.agw.arodevtest.hel.fi
* **STAGING:** https://yjdh-kesaseteli-ui-stg.apps.platta.hel.fi
    * 🛜 DNS alias: https://kesaseteli.stage.hel.ninja/
* **PROD:** https://yjdh-kesaseteli-ui-prod.apps.platta.hel.fi
    * 🛜 DNS alias: https://kesaseteli.hel.fi


### Youth frontend

Youths use this UI to make a summer voucher application.

* **DEV:** https://nuortenkesaseteli.dev.hel.ninja/
* **TEST:** https://kesaseteli-youth-ui-test.agw.arodevtest.hel.fi
* **STAGING:** https://kesaseteli-youth-ui-stg.apps.platta.hel.fi
    * 🛜 DNS alias: https://nuortenkesaseteli.stage.hel.ninja/
* **PROD:** https://kesaseteli-youth-ui-prod.apps.platta.hel.fi
    * 🛜 DNS alias: https://nuortenkesaseteli.hel.fi
    * Redirect from: https://nuorten.helsinki/kesaseteli/kesasetelihakemus


### City employee frontend

City employees use this UI to process summer Youth summer voucher applications that require manual processing.

* **DEV:** https://kesaseteli-handler-ui.dev.hel.ninja
* **TEST:** https://kesaseteli-handler-ui-test.agw.arodevtest.hel.fi
* **STAGING:** https://kesaseteli-handler-ui-stg.apps.platta.hel.fi
    * 🛜 DNS alias: https://kesaseteli-handler-ui.stage.hel.ninja/
* **PROD:** https://kesaseteli-handler-ui-prod.apps.platta.hel.fi
    * 🛜 DNS alias: https://kesasetelinkasittelija.hel.fi/


### City API and admin frontend

City employee (admin) use this UI to process customer employers' applications.

* **DEV:** https://yjdh-kesaseteli.api.dev.hel.ninja
    - Excel download: https://yjdh-kesaseteli.api.dev.hel.ninja/excel-download/
    - Admin site: https://yjdh-kesaseteli.api.dev.hel.ninja/admin/
* **TEST:** https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi
    - Excel download: https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi/excel-download/
    - Admin site: https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi/admin/
* **STAGING:** https://yjdh-kesaseteli-api-stg.apps.platta.hel.fi
    - 🛜 DNS alias: https://kesaseteli-api.stage.hel.ninja
    - Excel download: https://kesaseteli-api.stage.hel.ninja/excel-download/
    - Admin site: https://kesaseteli-api.stage.hel.ninja/admin/
* **PROD:** https://yjdh-kesaseteli-api-prod.apps.platta.hel.fi
    - 🛜 DNS alias: https://kesaseteli.api.hel.fi
    - Excel download: https://kesaseteli.api.hel.fi/excel-download/
    - Admin site: https://kesaseteli.api.hel.fi/admin/


## ADFS configurations

> **WARNING:** This configurations can easily change by time! Please check the Azure portal for the latest configuration.

Configuration is done in Azure portal: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/8f561d67-fcb3-44d2-9838-ca56a5c7d9d4.

Current redirect URI configuration for ADFS:
- ✅ 🛜 https://kesaseteli-api.stage.hel.ninja/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-stg.apps.platta.hel.fi/oauth2/callback
- ✅ 🛜 https://kesaseteli.api.hel.fi/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-prod.apps.platta.hel.fi/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi/oauth2/callback
- ✅ http://localhost:8000/oauth2/callback 
    - **NOTE: There could be another port configured for local development too, e.g. 8080 or 8081.**
- ⛔️ https://yjdh-kesaseteli-api-dev.agw.arodevtest.hel.fi/oauth2/callback 
    - **WARNING: No such domain.**

What there should be in ADFS redirect URI configuration (status on 2026-01-26):
- ✅ 🛜 https://kesaseteli-api.stage.hel.ninja/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-stg.apps.platta.hel.fi/oauth2/callback
- ✅ 🛜 https://kesaseteli.api.hel.fi/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-prod.apps.platta.hel.fi/oauth2/callback
- ✅ https://yjdh-kesaseteli-api-test.agw.arodevtest.hel.fi/oauth2/callback
- ✅ http://localhost:8000/oauth2/callback 
- 🆕 http://localhost:8080/oauth2/callback
- 🆕 http://localhost:8081/oauth2/callback
- 🆕 https://yjdh-kesaseteli-api-dev.agw.arodevtest.hel.fi/oauth2/callback
- 🆕 https://yjdh-kesaseteli.api.dev.hel.ninja/oauth2/callback
- 🆕 https://yjdh-kesaseteli.api.test.hel.ninja/oauth2/callback
- 🆕 https://yjdh-kesaseteli.api.stage.hel.ninja/oauth2/callback
- 🆕 kesaseteli.api.dev.hel.ninja/oauth2/callback
- 🆕 kesaseteli.api.test.hel.ninja/oauth2/callback
- 🆕 kesaseteli.api.stage.hel.ninja/oauth2/callback
- 🆕 *.api.dev.hel.ninja/oauth2/callback