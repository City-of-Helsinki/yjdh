# Changelog

## [1.5.2](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.5.1...kesaseteli-youth-v1.5.2) (2025-06-30)


### Bug Fixes

* **kesaseteli:** Accessibility statement link ([198a6d5](https://github.com/City-of-Helsinki/yjdh/commit/198a6d5f60e6b4ed77e44e2d466712f20e37afbe))
* **kesaseteli:** Change "nuorten.helsinki" links to "nuorten.hel.fi" ([433f064](https://github.com/City-of-Helsinki/yjdh/commit/433f064169250a15bae3ec9ffafe71d946dc0577))
* **kesaseteli:** Fix register information PDF-link in footer ([2cebdfc](https://github.com/City-of-Helsinki/yjdh/commit/2cebdfc3885ae8b1256d72ea7fa73481fabd46c5))
* **kesaseteli:** Privacy policy renamed same as title of related doc ([dbc21fe](https://github.com/City-of-Helsinki/yjdh/commit/dbc21fe986cc78a28f46339ddc92f56080899b7c))
* **kesaseteli:** Swedish common translations to youth app ([270fbed](https://github.com/City-of-Helsinki/yjdh/commit/270fbed6e9d4e413d3ef4daf41e4ec1db40f79a5))
* **kesaseteli:** Terms of service term renamed and link changed ([bbc52d0](https://github.com/City-of-Helsinki/yjdh/commit/bbc52d0202dd71948f413d1802eee3d0d9b9cc36))
* **kesaseteli:** Use lang specific accessibility statement url ([f04c7e2](https://github.com/City-of-Helsinki/yjdh/commit/f04c7e2857a0fe8a5687654dd0af4ec0feae147c))

## [1.5.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.5.0...kesaseteli-youth-v1.5.1) (2025-06-23)


### Bug Fixes

* Upgrade vulnerable Next.js version ([35259be](https://github.com/City-of-Helsinki/yjdh/commit/35259be9f183beb45638514c612e8d7829eff4da))

## [1.5.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.4.0...kesaseteli-youth-v1.5.0) (2025-04-28)


### Features

* Make "yarn dev" crossplatform in kesaseteli handler/employer/youth ([46c8d86](https://github.com/City-of-Helsinki/yjdh/commit/46c8d864130172d2010f27adf0b3685409aaf969))
* Upgrade Node to v22.13.1 HL-1583 ([6093cdd](https://github.com/City-of-Helsinki/yjdh/commit/6093cdde2bf6b29517093a08d505ee0a0ca750e0))


### Bug Fixes

* Bump nextjs version ([#3332](https://github.com/City-of-Helsinki/yjdh/issues/3332)) ([8c8935d](https://github.com/City-of-Helsinki/yjdh/commit/8c8935df53c61546fb1909da6bc1e1f6e9b8a1d3))
* Chrome v130 crashes on startup ([#3450](https://github.com/City-of-Helsinki/yjdh/issues/3450)) ([cad4466](https://github.com/City-of-Helsinki/yjdh/commit/cad44663f83bf1a90f4158c68c4f8b4a069ccfe8))

## [1.4.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.3.0...kesaseteli-youth-v1.4.0) (2024-07-27)


### Features

* **ks-handler:** Add UI for creating youth application without SSN ([e46958c](https://github.com/City-of-Helsinki/yjdh/commit/e46958cdee39abc3fd5c2fada5e2b2e894e8be95))


### Bug Fixes

* **frontend:** Don't use cross-env in scripts, didn't work in pipelines ([628d466](https://github.com/City-of-Helsinki/yjdh/commit/628d466c58fbbff7bf79e11f92a89ef9a2822439))
* **frontend:** Use cross-env in scripts to make them cross-platform ([7307e57](https://github.com/City-of-Helsinki/yjdh/commit/7307e5797d6b0a0bc24eded97d6724a5724a4547))
* Incorrect iban generation; kiss with file uploads ([#3057](https://github.com/City-of-Helsinki/yjdh/issues/3057)) ([b9b3810](https://github.com/City-of-Helsinki/yjdh/commit/b9b38101282a2d48216ea7123e6eb8e8075e5a2c))
* Try fixing failing tests ([#2952](https://github.com/City-of-Helsinki/yjdh/issues/2952)) ([3353dc8](https://github.com/City-of-Helsinki/yjdh/commit/3353dc84ce83906c4fe0bb8e4300b9a56640e47d))

## [1.3.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.2.0...kesaseteli-youth-v1.3.0) (2024-02-14)


### Features

* Permit more names in frontend NAMES_REGEX, update tests ([6b0e8b0](https://github.com/City-of-Helsinki/yjdh/commit/6b0e8b021db21c42bf44ace0827186abd1ec1625))
* **shared:** Add type for autoComplete property in React ([02df04c](https://github.com/City-of-Helsinki/yjdh/commit/02df04c707d4f6930663f6ce9bbc6cfac3ec1b4b))

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.1.1...kesaseteli-youth-v1.2.0) (2024-01-29)


### Features

* Don't autocomplete youth/employee's personally identifiable fields ([22a581d](https://github.com/City-of-Helsinki/yjdh/commit/22a581de28358bbfd4d42fb5f2b2a70e86bc9d5a))
* **kesaseteli:** Update summer voucher price for year 2024 to 350e ([22ae6aa](https://github.com/City-of-Helsinki/yjdh/commit/22ae6aa3f3789638aa32edc18b2af49558a948e0))
* **kesaseteli:** Update target groups for year 2024, update tests ([6a527ba](https://github.com/City-of-Helsinki/yjdh/commit/6a527badb87ee83302541cdd82a2391fac149821))

## [1.1.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.1.0...kesaseteli-youth-v1.1.1) (2024-01-15)


### Bug Fixes

* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-youth-v1.0.0...kesaseteli-youth-v1.1.0) (2023-12-13)


### Features

* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* Update finnish-ssn to 2.1.1 (HL-662) ([#2439](https://github.com/City-of-Helsinki/yjdh/issues/2439)) ([caad473](https://github.com/City-of-Helsinki/yjdh/commit/caad47333be57fd04c5fe57272f1b0832fad46e5))


### Bug Fixes

* Downgrade kesaseteli ssn library as the ks is not compliant yet ([#2481](https://github.com/City-of-Helsinki/yjdh/issues/2481)) ([c3756a3](https://github.com/City-of-Helsinki/yjdh/commit/c3756a3000e2d4174c0cb57a0fa609d377a83793))
