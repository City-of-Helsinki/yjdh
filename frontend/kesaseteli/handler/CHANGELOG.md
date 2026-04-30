# Changelog

## [2.0.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.5.0...kesaseteli-handler-v2.0.0) (2026-04-30)


### ⚠ BREAKING CHANGES

* **main:** upgrade Next.js from 14 to 15

### Features

* **ks,backend,frontend:** Use .env.kesaseteli-&lt;app&gt; files ([246be9b](https://github.com/City-of-Helsinki/yjdh/commit/246be9bbfeebc2119238adbaca0d6eff07c27bac))
* **ks,employer:** Replace ssn with birthdate and other misc fixes ([fa50e73](https://github.com/City-of-Helsinki/yjdh/commit/fa50e733c4653c3a0b9bfbc1566356f538a1debf))
* **ks,handler:** Add header with login and logout features ([11be4d7](https://github.com/City-of-Helsinki/yjdh/commit/11be4d7ec41326c6253f42bce72a1dfbdb2bdb96))
* **ks,handler:** Add target group field to anonymous youth form ([0d81504](https://github.com/City-of-Helsinki/yjdh/commit/0d81504165d0289790706c4eef32be5bfae19228))
* **ks,handler:** Handler can handle applications with invalid SSN ([324e295](https://github.com/City-of-Helsinki/yjdh/commit/324e29573a3dcb05dce33896fc199dd893d7b101))
* **ks,handler:** Notify about VTJ -data-restriction in Handlers UI ([f9f8304](https://github.com/City-of-Helsinki/yjdh/commit/f9f8304360bb348131c76fe646b479f0efdb3f3a))
* **main:** Upgrade to Next.js 15 ([#3810](https://github.com/City-of-Helsinki/yjdh/issues/3810)) ([4ee66b2](https://github.com/City-of-Helsinki/yjdh/commit/4ee66b2cad3183adcee5917ee04838e0aa723107))


### Bug Fixes

* **frontend,all:** Fix use of env vars in /frontend/next.config.js ([2094a07](https://github.com/City-of-Helsinki/yjdh/commit/2094a077c86b575721cf106258494fededcbaad7))
* **ks,handler:** Fetch summer voucher configuration with proper date ([9e2daf8](https://github.com/City-of-Helsinki/yjdh/commit/9e2daf85adf419de3fc4f1d5630dc7b906763916))
* **ks,handler:** Vtj data restricted should block other notifications ([c05f6aa](https://github.com/City-of-Helsinki/yjdh/commit/c05f6aa96b487c5da12f0a8b83d2ace3f7c1876a))
* **ks,shared:** Update axios for consistency and fix Nock test setup ([dec1979](https://github.com/City-of-Helsinki/yjdh/commit/dec19798c171cc6bcfbe3866f24d74525c9f1692))
* **ks:** Adfs logout handling ([240d21f](https://github.com/City-of-Helsinki/yjdh/commit/240d21ff78ed3a206dfa27bde130c6c8bbb83d83))
* **ks:** Handle cancelled login and suomi-fi -logout next-path ([b598d62](https://github.com/City-of-Helsinki/yjdh/commit/b598d6253ab5bd294013e3b9ec82a26b32631327))
* **ks:** Remove unnecessary "julkaisuun" word from form legends ([906c102](https://github.com/City-of-Helsinki/yjdh/commit/906c102bd910c0a83565b8fb1f6d9023d65328e5))
* **ks:** Youth form description should have dynamic voucher value ([0e51c3f](https://github.com/City-of-Helsinki/yjdh/commit/0e51c3fc85e6745f6fe967f020a740303d2d365c))


### Dependencies

* Update axios versions ([#3907](https://github.com/City-of-Helsinki/yjdh/issues/3907)) ([ea68ee2](https://github.com/City-of-Helsinki/yjdh/commit/ea68ee2d060637682659fd42d0df67f7cd9bfad8))

## [1.5.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.4.1...kesaseteli-handler-v1.5.0) (2025-12-30)


### Features

* **benefit:** Enable cloud sentry Ref: HL-1631 HL-1635 ([9c2884d](https://github.com/City-of-Helsinki/yjdh/commit/9c2884d4c5d01c4d0c7d03977bd34f5ffb5509e2))
* Use common ci wokflow for frontend HL-1637 ([#3778](https://github.com/City-of-Helsinki/yjdh/issues/3778)) ([c5dbf70](https://github.com/City-of-Helsinki/yjdh/commit/c5dbf7011bef2042f69d515908a45e571d74bf25))


### Bug Fixes

* Axios dependencies ([ab6edd6](https://github.com/City-of-Helsinki/yjdh/commit/ab6edd69a2fa7826bf8621e55824ab57fa5811a7))
* **kesaseteli:** Update target group ages to include 17 in handler UI ([3add5d5](https://github.com/City-of-Helsinki/yjdh/commit/3add5d51b4e3031a7a229c11dc174f7a8962cca7))
* **testcafe:** Use --disable-features=LocalNetworkAccessChecks ([1ef2407](https://github.com/City-of-Helsinki/yjdh/commit/1ef24070639929c35aba69133908206829616837))
* Update axios ([6563e30](https://github.com/City-of-Helsinki/yjdh/commit/6563e301a7249dbfdef95955383a9f33aa71e4d5))

## [1.4.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.4.0...kesaseteli-handler-v1.4.1) (2025-06-23)


### Bug Fixes

* Upgrade vulnerable Next.js version ([35259be](https://github.com/City-of-Helsinki/yjdh/commit/35259be9f183beb45638514c612e8d7829eff4da))

## [1.4.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.3.1...kesaseteli-handler-v1.4.0) (2025-04-28)


### Features

* Make "yarn dev" crossplatform in kesaseteli handler/employer/youth ([46c8d86](https://github.com/City-of-Helsinki/yjdh/commit/46c8d864130172d2010f27adf0b3685409aaf969))
* Upgrade Node to v22.13.1 HL-1583 ([6093cdd](https://github.com/City-of-Helsinki/yjdh/commit/6093cdde2bf6b29517093a08d505ee0a0ca750e0))


### Bug Fixes

* Bump nextjs version ([#3332](https://github.com/City-of-Helsinki/yjdh/issues/3332)) ([8c8935d](https://github.com/City-of-Helsinki/yjdh/commit/8c8935df53c61546fb1909da6bc1e1f6e9b8a1d3))
* Chrome v130 crashes on startup ([#3450](https://github.com/City-of-Helsinki/yjdh/issues/3450)) ([cad4466](https://github.com/City-of-Helsinki/yjdh/commit/cad44663f83bf1a90f4158c68c4f8b4a069ccfe8))

## [1.3.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.3.0...kesaseteli-handler-v1.3.1) (2024-07-27)


### Bug Fixes

* Incorrect iban generation; kiss with file uploads ([#3057](https://github.com/City-of-Helsinki/yjdh/issues/3057)) ([b9b3810](https://github.com/City-of-Helsinki/yjdh/commit/b9b38101282a2d48216ea7123e6eb8e8075e5a2c))

## [1.3.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.2.0...kesaseteli-handler-v1.3.0) (2024-05-07)


### Features

* **ks-handler:** Add UI for creating youth application without SSN ([e46958c](https://github.com/City-of-Helsinki/yjdh/commit/e46958cdee39abc3fd5c2fada5e2b2e894e8be95))
* **ks-handler:** Show/accept/reject youth applications that have no SSN ([2e91239](https://github.com/City-of-Helsinki/yjdh/commit/2e91239f6bdf36dc9a22a1efbfc70d3d261b4ef8))


### Bug Fixes

* **frontend:** Don't use cross-env in scripts, didn't work in pipelines ([628d466](https://github.com/City-of-Helsinki/yjdh/commit/628d466c58fbbff7bf79e11f92a89ef9a2822439))
* **frontend:** Use cross-env in scripts to make them cross-platform ([7307e57](https://github.com/City-of-Helsinki/yjdh/commit/7307e5797d6b0a0bc24eded97d6724a5724a4547))

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.1.1...kesaseteli-handler-v1.2.0) (2024-01-29)


### Features

* **kesaseteli:** Update year 2024's target groups' ages in frontend ([6465b86](https://github.com/City-of-Helsinki/yjdh/commit/6465b866ad9b7e6250aaf13085f8094cdedc4258))

## [1.1.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.1.0...kesaseteli-handler-v1.1.1) (2024-01-16)


### Bug Fixes

* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v1.0.0...kesaseteli-handler-v1.1.0) (2023-12-13)


### Features

* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* Update finnish-ssn to 2.1.1 (HL-662) ([#2439](https://github.com/City-of-Helsinki/yjdh/issues/2439)) ([caad473](https://github.com/City-of-Helsinki/yjdh/commit/caad47333be57fd04c5fe57272f1b0832fad46e5))


### Bug Fixes

* Downgrade kesaseteli ssn library as the ks is not compliant yet ([#2481](https://github.com/City-of-Helsinki/yjdh/issues/2481)) ([c3756a3](https://github.com/City-of-Helsinki/yjdh/commit/c3756a3000e2d4174c0cb57a0fa609d377a83793))
