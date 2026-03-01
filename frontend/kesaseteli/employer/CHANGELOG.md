# Changelog

## [1.6.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.5.2...kesaseteli-employer-v1.6.0) (2026-03-01)


### Features

* **benefit:** Enable cloud sentry Ref: HL-1631 HL-1635 ([9c2884d](https://github.com/City-of-Helsinki/yjdh/commit/9c2884d4c5d01c4d0c7d03977bd34f5ffb5509e2))
* **kesaseteli:** Migrate summer voucher serial numbers to foreign keys ([fa61eed](https://github.com/City-of-Helsinki/yjdh/commit/fa61eedf7bff950f069488c064a62f8ff050f77c))
* **ks,backend,frontend:** Use .env.kesaseteli-&lt;app&gt; files ([246be9b](https://github.com/City-of-Helsinki/yjdh/commit/246be9bbfeebc2119238adbaca0d6eff07c27bac))
* **ks,employer:** Fetch target group options to form from API ([46af5ca](https://github.com/City-of-Helsinki/yjdh/commit/46af5ca85d5fb6dbf51cf36075e86fe86f66ca83))
* **ks,employer:** Session storage for wizard values ([8523c5a](https://github.com/City-of-Helsinki/yjdh/commit/8523c5a70d468e70c154723576d3ebe038e76f3e))
* **ks,employer:** Single form wizard form flow ([31604ce](https://github.com/City-of-Helsinki/yjdh/commit/31604ceadad8f9b7afce37e9a0e97d22ae5eaccd))
* **ks,frontend:** Add matomo & cookie consent to employer & youth UIs ([4be9366](https://github.com/City-of-Helsinki/yjdh/commit/4be936621bd5e75e8e841d7f4ec651d6842d6697))
* **ks,frontend:** Add translations for organization type & job type ([e89e4dc](https://github.com/City-of-Helsinki/yjdh/commit/e89e4dc8a09a5c41eeb33c3e078c9d9b4de714f3))
* Use common ci wokflow for frontend HL-1637 ([#3778](https://github.com/City-of-Helsinki/yjdh/issues/3778)) ([c5dbf70](https://github.com/City-of-Helsinki/yjdh/commit/c5dbf7011bef2042f69d515908a45e571d74bf25))


### Bug Fixes

* Axios dependencies ([ab6edd6](https://github.com/City-of-Helsinki/yjdh/commit/ab6edd69a2fa7826bf8621e55824ab57fa5811a7))
* **benefit:** Cleanup next.config.js Ref: HL-1631 ([ad077c3](https://github.com/City-of-Helsinki/yjdh/commit/ad077c361f7fd00b91ee8ad097ea194d4cb62ec9))
* **frontend,all:** Fix use of env vars in /frontend/next.config.js ([2094a07](https://github.com/City-of-Helsinki/yjdh/commit/2094a077c86b575721cf106258494fededcbaad7))
* **ks,employer:** Init list of vouchers with an empty one ([ff1fc5e](https://github.com/City-of-Helsinki/yjdh/commit/ff1fc5ee36cd0a01714afe473e7ac8fec9eb4dbc))
* **ks,employer:** Leave SSN field as read only after data is fetched ([03a5e21](https://github.com/City-of-Helsinki/yjdh/commit/03a5e218115798cfe8df450056a57f7a59f8dcd3))
* **ks,employer:** Notification flashing briefly ([5548e78](https://github.com/City-of-Helsinki/yjdh/commit/5548e78c24f5f505da3dc39344c7ef196020ef5c))
* **ks,employer:** Translations ([71832e7](https://github.com/City-of-Helsinki/yjdh/commit/71832e7380309506d76693ba7c2ad2dd9aed337a))
* **ks,shared:** Update axios for consistency and fix Nock test setup ([dec1979](https://github.com/City-of-Helsinki/yjdh/commit/dec19798c171cc6bcfbe3866f24d74525c9f1692))
* Linter error ([c100fea](https://github.com/City-of-Helsinki/yjdh/commit/c100feae76a6b765e3be075d6a92f0d23fdfbd20))
* **testcafe:** Use --disable-features=LocalNetworkAccessChecks ([1ef2407](https://github.com/City-of-Helsinki/yjdh/commit/1ef24070639929c35aba69133908206829616837))
* Update axios ([6563e30](https://github.com/City-of-Helsinki/yjdh/commit/6563e301a7249dbfdef95955383a9f33aa71e4d5))


### Dependencies

* Update axios versions ([#3907](https://github.com/City-of-Helsinki/yjdh/issues/3907)) ([ea68ee2](https://github.com/City-of-Helsinki/yjdh/commit/ea68ee2d060637682659fd42d0df67f7cd9bfad8))

## [1.5.2](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.5.1...kesaseteli-employer-v1.5.2) (2025-06-30)


### Bug Fixes

* **kesaseteli:** Accessibility statement link ([198a6d5](https://github.com/City-of-Helsinki/yjdh/commit/198a6d5f60e6b4ed77e44e2d466712f20e37afbe))
* **kesaseteli:** Terms of service term renamed and link changed ([bbc52d0](https://github.com/City-of-Helsinki/yjdh/commit/bbc52d0202dd71948f413d1802eee3d0d9b9cc36))
* **kesaseteli:** Update terms and conditions link ([0b91729](https://github.com/City-of-Helsinki/yjdh/commit/0b91729d4b0216aa39daf340303ce9a2dcdd5532))
* **kesaseteli:** Use lang specific accessibility statement url ([f04c7e2](https://github.com/City-of-Helsinki/yjdh/commit/f04c7e2857a0fe8a5687654dd0af4ec0feae147c))

## [1.5.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.5.0...kesaseteli-employer-v1.5.1) (2025-06-23)


### Bug Fixes

* Upgrade vulnerable Next.js version ([35259be](https://github.com/City-of-Helsinki/yjdh/commit/35259be9f183beb45638514c612e8d7829eff4da))

## [1.5.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.4.0...kesaseteli-employer-v1.5.0) (2025-04-28)


### Features

* Make "yarn dev" crossplatform in kesaseteli handler/employer/youth ([46c8d86](https://github.com/City-of-Helsinki/yjdh/commit/46c8d864130172d2010f27adf0b3685409aaf969))
* Upgrade Node to v22.13.1 HL-1583 ([6093cdd](https://github.com/City-of-Helsinki/yjdh/commit/6093cdde2bf6b29517093a08d505ee0a0ca750e0))


### Bug Fixes

* Bump nextjs version ([#3332](https://github.com/City-of-Helsinki/yjdh/issues/3332)) ([8c8935d](https://github.com/City-of-Helsinki/yjdh/commit/8c8935df53c61546fb1909da6bc1e1f6e9b8a1d3))
* Chrome v130 crashes on startup ([#3450](https://github.com/City-of-Helsinki/yjdh/issues/3450)) ([cad4466](https://github.com/City-of-Helsinki/yjdh/commit/cad44663f83bf1a90f4158c68c4f8b4a069ccfe8))

## [1.4.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.3.0...kesaseteli-employer-v1.4.0) (2024-07-27)


### Features

* **ks-handler:** Add UI for creating youth application without SSN ([e46958c](https://github.com/City-of-Helsinki/yjdh/commit/e46958cdee39abc3fd5c2fada5e2b2e894e8be95))


### Bug Fixes

* **frontend:** Don't use cross-env in scripts, didn't work in pipelines ([628d466](https://github.com/City-of-Helsinki/yjdh/commit/628d466c58fbbff7bf79e11f92a89ef9a2822439))
* **frontend:** Use cross-env in scripts to make them cross-platform ([7307e57](https://github.com/City-of-Helsinki/yjdh/commit/7307e5797d6b0a0bc24eded97d6724a5724a4547))
* Incorrect iban generation; kiss with file uploads ([#3057](https://github.com/City-of-Helsinki/yjdh/issues/3057)) ([b9b3810](https://github.com/City-of-Helsinki/yjdh/commit/b9b38101282a2d48216ea7123e6eb8e8075e5a2c))

## [1.3.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.2.0...kesaseteli-employer-v1.3.0) (2024-02-14)


### Features

* **shared:** Add type for autoComplete property in React ([02df04c](https://github.com/City-of-Helsinki/yjdh/commit/02df04c707d4f6930663f6ce9bbc6cfac3ec1b4b))

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.1.1...kesaseteli-employer-v1.2.0) (2024-01-29)


### Features

* Don't autocomplete youth/employee's personally identifiable fields ([22a581d](https://github.com/City-of-Helsinki/yjdh/commit/22a581de28358bbfd4d42fb5f2b2a70e86bc9d5a))
* **fetch_employee_data:** Add specific "Not found" error message ([9d667f3](https://github.com/City-of-Helsinki/yjdh/commit/9d667f3257d75a21acb0ff5fb2f98bf941812c39))
* **kesaseteli:** Update target groups for year 2024, update tests ([6a527ba](https://github.com/City-of-Helsinki/yjdh/commit/6a527badb87ee83302541cdd82a2391fac149821))

## [1.1.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.1.0...kesaseteli-employer-v1.1.1) (2023-11-07)


### Bug Fixes

* **dateinput:** Clear validation errors when a datepicker selects a date ([0f27519](https://github.com/City-of-Helsinki/yjdh/commit/0f27519cda36372c3d6b049c648afa1c3bc34009))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-employer-v1.0.0...kesaseteli-employer-v1.1.0) (2023-06-08)


### Features

* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
