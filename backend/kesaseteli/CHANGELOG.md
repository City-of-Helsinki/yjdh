# Changelog

## [1.12.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.11.0...kesaseteli-backend-v1.12.0) (2026-03-01)


### Features

* **kesaseteli,admin:** Add custom admin site for context management ([3721d49](https://github.com/City-of-Helsinki/yjdh/commit/3721d49fb38e6494d91b3518da0bde104a985091))
* **kesaseteli,admin:** Admin employer applications and vouchers ([ab9ed4b](https://github.com/City-of-Helsinki/yjdh/commit/ab9ed4bf66c38bca98c64fdec975243cb7fc6196))
* **kesaseteli,admin:** Admin youth applications and summer vouchers ([9a3a4bb](https://github.com/City-of-Helsinki/yjdh/commit/9a3a4bbb6386feed93ccc2de4c782f2594b59cf9))
* **kesaseteli,admin:** Import schools ([8849897](https://github.com/City-of-Helsinki/yjdh/commit/8849897b9dc645cb6a136bfa26864909adfad3b4))
* **kesaseteli,admin:** Login to admin site with ADFS ([9808a43](https://github.com/City-of-Helsinki/yjdh/commit/9808a43fd04435e9e9e5ab6a5cff0bc8bfdb3159))
* **kesaseteli,admin:** More features in school admin page ([2612cea](https://github.com/City-of-Helsinki/yjdh/commit/2612cea70ebc655bbd2345192252a3b67928ab4a))
* **kesaseteli,admin:** Register organisation to admin site ([cf3f359](https://github.com/City-of-Helsinki/yjdh/commit/cf3f3595d34191a688e7eb01b82299a7ff4195e6))
* **kesaseteli,admin:** Resend youth summer vouchers ([cb7d6ca](https://github.com/City-of-Helsinki/yjdh/commit/cb7d6ca2a79682bc45b96ed163e433aed261f518))
* **kesaseteli,admin:** Tools for semi automated admin management ([a861f35](https://github.com/City-of-Helsinki/yjdh/commit/a861f35cae5423640903d75494e15c45537e9418))
* **kesaseteli:** Add API endpoint for summer voucher configuration ([f305951](https://github.com/City-of-Helsinki/yjdh/commit/f305951fa67f1b03e5801127eb3758fbdc5375aa))
* **kesaseteli:** Add API endpoint to list available target groups ([7a2f104](https://github.com/City-of-Helsinki/yjdh/commit/7a2f1048880c7bcdb2623c18fc44ce7bd2b6e451))
* **kesaseteli:** Add description property to target group ([b73084a](https://github.com/City-of-Helsinki/yjdh/commit/b73084ac3a74bc20552a6c2c11f1e4789d4cf462))
* **kesaseteli:** Change verbose name for employer appl. and voucher ([0235932](https://github.com/City-of-Helsinki/yjdh/commit/02359324d34471341a0145f279faa5db8e24c2b8))
* **kesaseteli:** Docker-entrypoint to create summer voucher config ([99cfad6](https://github.com/City-of-Helsinki/yjdh/commit/99cfad6d29171df751aa7203c0505e7bdca50077))
* **kesaseteli:** Migrate summer voucher serial numbers to foreign keys ([fa61eed](https://github.com/City-of-Helsinki/yjdh/commit/fa61eedf7bff950f069488c064a62f8ff050f77c))
* **kesaseteli:** Mngmt.cmd. to create summer voucher config instance ([3cdaa45](https://github.com/City-of-Helsinki/yjdh/commit/3cdaa45dd225444d1d164653e52f4f17775d478e))
* **kesaseteli:** Models and base files for email templates ([ca19e0c](https://github.com/City-of-Helsinki/yjdh/commit/ca19e0c040cecde96c8439e77622d69cd4e038e5))
* **kesaseteli:** Reject appl. if no summer voucher config for year ([584c4b9](https://github.com/City-of-Helsinki/yjdh/commit/584c4b90be2df94f9ddaa6e7f5d31e08eb95f950))
* **kesaseteli:** Summer voucher configuration ([d9cd7b0](https://github.com/City-of-Helsinki/yjdh/commit/d9cd7b06576a19747f6c4462f4cc76bc5fec8c6f))
* **kesaseteli:** Upgrade from PostgreSQL 13 → 17 ([91e03f1](https://github.com/City-of-Helsinki/yjdh/commit/91e03f11c1d35f0848d7d3c751845c1529bf5ebc))
* **kesaseteli:** Upgrade YTJ client to use v3 endpoint ([e688f74](https://github.com/City-of-Helsinki/yjdh/commit/e688f748d2f9e4a435a38f056ace7f23e5421c9f))
* **ks,admin:** Full permissions for superuser ([43dde8f](https://github.com/City-of-Helsinki/yjdh/commit/43dde8f7e9d3ebdadc6da4542093858c58694bfc))
* **ks,backend,frontend:** Use .env.kesaseteli-&lt;app&gt; files ([246be9b](https://github.com/City-of-Helsinki/yjdh/commit/246be9bbfeebc2119238adbaca0d6eff07c27bac))
* **ks,backend:** Add & populate Company.created_at & modified_at fields ([7b8a302](https://github.com/City-of-Helsinki/yjdh/commit/7b8a302b9173aa686d862391c9a50b3a569cd598))
* **ks,backend:** Add 15, 18 y.o. Helsinkian target groups, not defaults ([eec29b8](https://github.com/City-of-Helsinki/yjdh/commit/eec29b834f7e02fa5161570c9cd445829b42d561))
* **ks,backend:** Add django-filter package ([520577c](https://github.com/City-of-Helsinki/yjdh/commit/520577c3bb3d11885e3335e10d41d65a8a0b3369))
* **ks,backend:** Add EmployerApplicationViewSet limit+offset pagination ([4953152](https://github.com/City-of-Helsinki/yjdh/commit/495315209dce8af64ed412a07d27b9b101792b9a))
* **ks,backend:** Add OrganizationType enum & Company.organization_type ([861a801](https://github.com/City-of-Helsinki/yjdh/commit/861a8013594a0475faf08dff3c1b19f23844f356))
* **ks,backend:** Allow filtering & ordering EmployerApplicationViewSet ([bc70a4b](https://github.com/City-of-Helsinki/yjdh/commit/bc70a4b0879162940eba50e5fd3554cd181ad4ad))
* **ks,backend:** Index Company.name for search & ordering performance ([530697e](https://github.com/City-of-Helsinki/yjdh/commit/530697e6f0c5b6617635dd289dff301084fa377a))
* **ks,backend:** Index EmployerApplication timestamps & status field ([83b0455](https://github.com/City-of-Helsinki/yjdh/commit/83b0455ad796eb64f63912d6674f72da0dd52605))
* **ks,backend:** Make Company.business_id unique ([bdb8f27](https://github.com/City-of-Helsinki/yjdh/commit/bdb8f27ea2bd47d146abb6c6e78f2d73ff786b26))
* **ks,backend:** Upgrade Django 5.1→5.2 and all packages ([ac8059e](https://github.com/City-of-Helsinki/yjdh/commit/ac8059eb8e17579449dcc2fd58b3b30c9e123fa4))
* **ks:** Remove target_group field from employer summer voucher ([31909cc](https://github.com/City-of-Helsinki/yjdh/commit/31909cc074667f034a836fc52e07d6face2a3137))
* **shared,admin:** Login form can be hidden if context disables it ([a9ec357](https://github.com/City-of-Helsinki/yjdh/commit/a9ec35726ee945d7819247699d1a3e0ecd5f6b72))
* Update remaining pyproject.toml files to use ruff with python 3.12 ([f2c02a8](https://github.com/City-of-Helsinki/yjdh/commit/f2c02a84ef619522f93a2afcf94bb1e57c75d73d))
* Upgrade to Python 3.12 in shared backend and in kesaseteli ([e622132](https://github.com/City-of-Helsinki/yjdh/commit/e622132b4db15738a39ecc678386c7f9711348ab))


### Bug Fixes

* **kesaseteli:** Add fixture to enable admin site on every unit test ([1c59891](https://github.com/City-of-Helsinki/yjdh/commit/1c598915583fac57d19520ca9e3d848a3894e7c7))
* **kesaseteli:** Add organization_type to organisation serializer ([6dbe5e0](https://github.com/City-of-Helsinki/yjdh/commit/6dbe5e0fe2806539752e8f357a5a2d0f65771190))
* **ks,backend:** Make excel-download page better UI-wise ([5f36438](https://github.com/City-of-Helsinki/yjdh/commit/5f36438d2bbe9902e67777d0f9dd1da9daae823e))
* **ks,backend:** Update migrations after merging of PR [#3871](https://github.com/City-of-Helsinki/yjdh/issues/3871) ([5e09a54](https://github.com/City-of-Helsinki/yjdh/commit/5e09a548fd1dc5edea4f2e86516e4c67fb2d4cd5))
* **ks:** Employer application should allow empty target group ([ddef4d4](https://github.com/City-of-Helsinki/yjdh/commit/ddef4d41c5f4db3e111e68aa97ddbe0199747737))
* Null pointer exception in excel exporter ([339403b](https://github.com/City-of-Helsinki/yjdh/commit/339403b00aa354d22665e6805e613d1b702142ee))


### Dependencies

* **deps:** Bump azure-core in /backend/kesaseteli ([a3ed2fd](https://github.com/City-of-Helsinki/yjdh/commit/a3ed2fd3e0478458dee323e1927c20fc9996fce9))
* **deps:** Bump pillow from 12.0.0 to 12.1.1 in /backend/kesaseteli ([46ec9b2](https://github.com/City-of-Helsinki/yjdh/commit/46ec9b23af81898139aa0c5cfb49c2faae8c96ab))
* **kesaseteli:** Replace old pytest-freezegun with newer pytest-freezer ([7b023be](https://github.com/City-of-Helsinki/yjdh/commit/7b023bed1f703764f1ce061b1229c0ace1d27db9))
* **kesaseteli:** Upgrade backend packages, use django 5.1 ([e16ca81](https://github.com/City-of-Helsinki/yjdh/commit/e16ca8173fdb9725502d8f97a8b89ff0b98f5c6f))
* **kesaseteli:** Upgrade pip-tools to 7.5.2 so it works with pip 25.3 ([0ae06bc](https://github.com/City-of-Helsinki/yjdh/commit/0ae06bc3301cce5fcf91731afe4c1d483070f829))


### Documentation

* Add note about about test data generation ([a8fe0b4](https://github.com/City-of-Helsinki/yjdh/commit/a8fe0b4acfb6074cea1459098c1c66cf119a3a1e))
* **env:** Add DATABASE_URL environment variable in env example ([b8041f1](https://github.com/City-of-Helsinki/yjdh/commit/b8041f19a9b65d97acd51fd1818b49f04a3e3f17))
* **kesaseteli:** Application endpoints and ADFS configuration ([e275325](https://github.com/City-of-Helsinki/yjdh/commit/e275325eb9fe886b8e9fd85ee2f02603294c03d6))
* **kesaseteli:** Document authentication methods by UI ([6226900](https://github.com/City-of-Helsinki/yjdh/commit/6226900f675bcc736291a0149aeb19d71e97e8d9))
* **kesaseteli:** Improve summer voucher config docs ([a3fc7f5](https://github.com/City-of-Helsinki/yjdh/commit/a3fc7f571d952c43e1aab84c646c9b9d0a68f50d))
* **kesaseteli:** Management command documentation ([e81f712](https://github.com/City-of-Helsinki/yjdh/commit/e81f712483c0c43ab6176023294a2f6c531d0d49))
* **kesaseteli:** Yearly configuration and email templates management ([cf7df28](https://github.com/City-of-Helsinki/yjdh/commit/cf7df28de337d1c3cefc95986f79e60592d20c07))

## [1.11.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.5...kesaseteli-backend-v1.11.0) (2025-12-19)


### Features

* **kesaseteli:** Set school list for year 2026 ([90f200f](https://github.com/City-of-Helsinki/yjdh/commit/90f200fba5565329d137fb940885b5eb68e22b89))
* **kesaseteli:** Update target group ages from 16 → 16/17 for year 2026 ([a59ac5e](https://github.com/City-of-Helsinki/yjdh/commit/a59ac5ead84407896c45c8035df6c98bf16a3f45))

## [1.10.5](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.4...kesaseteli-backend-v1.10.5) (2025-12-05)


### Dependencies

* **deps:** Bump django from 4.2.26 to 4.2.27 in /backend/kesaseteli ([c1f7214](https://github.com/City-of-Helsinki/yjdh/commit/c1f72149864650b49d0d2002b87bd433886d5c4c))

## [1.10.4](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.3...kesaseteli-backend-v1.10.4) (2025-11-11)


### Bug Fixes

* Postgres database to use database url + password combination ([7e539d0](https://github.com/City-of-Helsinki/yjdh/commit/7e539d0a4872f194d414c24da4386475fcf1e7b3))
* **tests:** Fix Kesäseteli test case failing when run in parallel ([990a063](https://github.com/City-of-Helsinki/yjdh/commit/990a063e2e28cef3d4e2d8e9ff19c586a6e3173c))


### Dependencies

* **deps:** Bump django from 4.2.24 to 4.2.25 in /backend/kesaseteli ([3d71553](https://github.com/City-of-Helsinki/yjdh/commit/3d71553d4984451c0a6544bb6fcc52b5fa097989))
* **deps:** Bump django from 4.2.25 to 4.2.26 in /backend/kesaseteli ([3f67ff6](https://github.com/City-of-Helsinki/yjdh/commit/3f67ff63fbd5c651353adbd1975ee7ca8ec176cb))
* **kesaseteli:** Replace black, flake8 and isort with ruff ([aeb2e07](https://github.com/City-of-Helsinki/yjdh/commit/aeb2e07ee5c135be9bc742b9e1c5a99b6e523244))
* Replace black, flake8 and isort with ruff in pre-commit ([6f7c1f1](https://github.com/City-of-Helsinki/yjdh/commit/6f7c1f1fd955a2d1230abf6b98ee93d9f09bbaab))


### Documentation

* **kesaseteli:** Update documentation on code format ([06ac65a](https://github.com/City-of-Helsinki/yjdh/commit/06ac65a1a61d816be54c2feb17b404224fd1a930))
* **kesaseteli:** Update README ([9be0852](https://github.com/City-of-Helsinki/yjdh/commit/9be0852db143ee201b860062b22ff667c31f5f2a))

## [1.10.3](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.2...kesaseteli-backend-v1.10.3) (2025-09-16)


### Bug Fixes

* **kesaseteli:** Disable Django Rest Framework Browsable API & fix tests ([d3b5afa](https://github.com/City-of-Helsinki/yjdh/commit/d3b5afa6867c9317df1080a13f341b2c691d30d2))

## [1.10.2](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.1...kesaseteli-backend-v1.10.2) (2025-09-12)


### Dependencies

* **deps:** Bump django from 4.2.14 to 4.2.24 in /backend/kesaseteli ([00e8f97](https://github.com/City-of-Helsinki/yjdh/commit/00e8f9760e7067e93215c4e44a1cd28e86df4551))

## [1.10.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.10.0...kesaseteli-backend-v1.10.1) (2024-09-26)


### Bug Fixes

* Update Suomi.fi IDP test/production metadata ([9ad2230](https://github.com/City-of-Helsinki/yjdh/commit/9ad22307b3f8fcc24c559e4544ad01ebdc75c643))

## [1.10.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.9.0...kesaseteli-backend-v1.10.0) (2024-07-26)


### Features

* Upgrade Django to 4.2 & all dependencies except black/isort/flake8 ([2cc6daf](https://github.com/City-of-Helsinki/yjdh/commit/2cc6dafec36f7868d443e94c9927d83d0a20dcfc))
* Upgrade Kesäseteli's backend to Red Hat's ubi9 image of Python 3.9 ([fce22cb](https://github.com/City-of-Helsinki/yjdh/commit/fce22cbbe84c434e3d19d34f1a73d3d9539d552f))


### Bug Fixes

* **kesaseteli:** Downgrade to elasticsearch v7 to fix send_audit_log ([6d38c02](https://github.com/City-of-Helsinki/yjdh/commit/6d38c0242184b5271e46cd6797ceb6f38dc32bc3))

## [1.9.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.8.0...kesaseteli-backend-v1.9.0) (2024-05-07)


### Features

* **ks-backend:** Add create_without_ssn endpoint & tests for it ([097b099](https://github.com/City-of-Helsinki/yjdh/commit/097b09944c83e03ff0dae0848ab07d33f3dc8900))
* **ks-handler:** Add UI for creating youth application without SSN ([e46958c](https://github.com/City-of-Helsinki/yjdh/commit/e46958cdee39abc3fd5c2fada5e2b2e894e8be95))

## [1.8.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.7.0...kesaseteli-backend-v1.8.0) (2024-02-28)


### Features

* **kesaseteli:** Add fallback youth summer voucher logo without price ([4a01aec](https://github.com/City-of-Helsinki/yjdh/commit/4a01aec822f53e7e963ebc74000df8e1076f5e97))

## [1.7.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.6.0...kesaseteli-backend-v1.7.0) (2024-02-14)


### Features

* Permit more names in YouthApplication (first|last)_name & school ([cc10fb1](https://github.com/City-of-Helsinki/yjdh/commit/cc10fb15ae0be349f3c5a751c113cefd4f75e912))

## [1.6.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.5.0...kesaseteli-backend-v1.6.0) (2024-02-13)


### Features

* Parametrize youth summer voucher email templates & update for 2024 ([32a0e1c](https://github.com/City-of-Helsinki/yjdh/commit/32a0e1c4d05dad2809aa9e17c06d845a4d1ccffe))

## [1.5.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.4.0...kesaseteli-backend-v1.5.0) (2024-02-01)


### Features

* **kesaseteli:** Add annual Excel download for previous year ([8eca4e7](https://github.com/City-of-Helsinki/yjdh/commit/8eca4e789b1cb22a1ed221887437a6d499cf2aff))

## [1.4.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.3.1...kesaseteli-backend-v1.4.0) (2024-01-29)


### Features

* **kesaseteli:** Update salary to 500e & year to 2024 in voucher email ([9135157](https://github.com/City-of-Helsinki/yjdh/commit/9135157820c8b51cc151963a3bcedae09202a0b7))
* **kesaseteli:** Update summer voucher price for year 2024 to 350e ([22ae6aa](https://github.com/City-of-Helsinki/yjdh/commit/22ae6aa3f3789638aa32edc18b2af49558a948e0))
* **kesaseteli:** Update target groups for year 2024, update tests ([6a527ba](https://github.com/City-of-Helsinki/yjdh/commit/6a527badb87ee83302541cdd82a2391fac149821))
* Specify Excel exporter's salary & sum fields as €, cast sum as int ([401f815](https://github.com/City-of-Helsinki/yjdh/commit/401f8157f5b80bf67e1de19fd505e1bfdd754859))

## [1.3.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.3.0...kesaseteli-backend-v1.3.1) (2024-01-16)


### Bug Fixes

* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

## [1.3.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.2.0...kesaseteli-backend-v1.3.0) (2023-12-14)


### Features

* **ks-backend:** Set default EMAIL_HOST to relay.hel.fi ([94ba1fb](https://github.com/City-of-Helsinki/yjdh/commit/94ba1fb96cb9d9026908dbaae59ef83010e3c909))
* Upgrade django to 3.2.23 (i.e. latest 3.2.x) in all backends ([410ac0e](https://github.com/City-of-Helsinki/yjdh/commit/410ac0e2f042774e0fdd12a862242ce481dff46b))

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.1.0...kesaseteli-backend-v1.2.0) (2023-06-08)


### Features

* **ks-backend:** Add summer voucher ID to fetch_employee_data I/O ([031f8ec](https://github.com/City-of-Helsinki/yjdh/commit/031f8ec8db1427e2fcb4e13ec4c5ed8f122897d2))
* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-backend-v1.0.0...kesaseteli-backend-v1.1.0) (2023-06-02)


### Features

* **ks-backend:** Add fetch_employee_data endpoint to fill employee form ([5a9cdd7](https://github.com/City-of-Helsinki/yjdh/commit/5a9cdd78b995a87a7cf87dd3ff128024ec409d4c))
