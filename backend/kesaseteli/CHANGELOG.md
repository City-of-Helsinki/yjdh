# Changelog

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
