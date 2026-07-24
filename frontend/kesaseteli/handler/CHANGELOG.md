# Changelog

## [2.3.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v2.2.0...kesaseteli-handler-v2.3.0) (2026-07-24)


### Features

* **ks,frontend:** Add csp headers to frontend ([900cbcb](https://github.com/City-of-Helsinki/yjdh/commit/900cbcb00187a41d65cabb24d1d4998b15e3f6a6))
* **ks,handler,youth:** Show amount of items in accordion headings ([999977f](https://github.com/City-of-Helsinki/yjdh/commit/999977f19ad556bb8e13838deeed7956c92b5c85))
* **ks,handler:** Adapt timeline UI to support activity log items ([66e1de1](https://github.com/City-of-Helsinki/yjdh/commit/66e1de10cf82715555c1536fbcd439d0db5b20b9))
* **ks,handler:** Add attachments accordion to employer detail view ([eb78561](https://github.com/City-of-Helsinki/yjdh/commit/eb785616ed8de8933d8e0ee3fb2d46ccdd484bdf))
* **ks,handler:** Add status filters for youth and employer lists ([7d52741](https://github.com/City-of-Helsinki/yjdh/commit/7d5274185a6a6592e88f55faf4b63e48f9a775c6))
* **ks,handler:** Add status filters to youth and employer lists ([e360544](https://github.com/City-of-Helsinki/yjdh/commit/e360544635cf5d2315b4a46832c6e907f744d310))
* **ks,handler:** Handler attachment mgmt for employer apps ([c1a43a3](https://github.com/City-of-Helsinki/yjdh/commit/c1a43a36cc66ff74e858b0349f8c0fbc4b62b8fc))
* **ks,handler:** Implement common FilterSection component ([d2af4ed](https://github.com/City-of-Helsinki/yjdh/commit/d2af4ed02f2a91056ada435efbe7373b4f7750ab))
* **ks,handler:** Implement dismissible warning notification on mobile ([dca20b3](https://github.com/City-of-Helsinki/yjdh/commit/dca20b3eb28315b9f15417dcd280d5872acb5642))
* **ks,handler:** Implement new dashboard and application lists ([cd5cafa](https://github.com/City-of-Helsinki/yjdh/commit/cd5cafa86707cc63beb93c44d5c5483f87527e28))
* **ks,handler:** Implement user context and improve auth flow ([4f75e31](https://github.com/City-of-Helsinki/yjdh/commit/4f75e31e531200ea4118afc6931dfd0c5fd41ee8))
* **ks,handler:** Introduce React Query hooks and type definitions ([c3c8c13](https://github.com/City-of-Helsinki/yjdh/commit/c3c8c13634f034e14fed46ce693180679d43190c))
* **ks,handler:** Make voucher navigation tabs sticky during scroll ([3adaf1f](https://github.com/City-of-Helsinki/yjdh/commit/3adaf1fb5f350752bd31b57036768377fa2ffc00))
* **ks,handler:** Persist active tab state in application lists ([3dbab99](https://github.com/City-of-Helsinki/yjdh/commit/3dbab99ca76af734c60a8f9fbf7b5e4b36af980c))
* **ks,handler:** Redesign youth application view layout and alerts ([6dc5c76](https://github.com/City-of-Helsinki/yjdh/commit/6dc5c76939d0be9656465d936e1165382e7c2535))
* **ks,shared,handler:** Add masking utils and shared configs ([5845e7f](https://github.com/City-of-Helsinki/yjdh/commit/5845e7f629d0a38bdb481d5d7303674b653077e0))
* **ks,shared,handler:** Integrate handler notes and timeline UI ([3f5c74b](https://github.com/City-of-Helsinki/yjdh/commit/3f5c74b6f90aa710a33502fbf430481656eded34))
* **ks:** Make attachment file names clickable download links ([7019948](https://github.com/City-of-Helsinki/yjdh/commit/7019948de608c11428564d10e632d04e33dccfd3))
* **ks:** Show detailed employer application view and form refactor ([5d1faa9](https://github.com/City-of-Helsinki/yjdh/commit/5d1faa9142aacc4f71fda193684a167f6f97a246))


### Bug Fixes

* **ks,backend:** Unblock django admin without widening global csp ([5b60c6b](https://github.com/City-of-Helsinki/yjdh/commit/5b60c6bad10f8d6bd75fb1bc1deaddd5b5b6aa66))
* **ks,handler:** Resolve handler lint, format, and semantic bugs ([a8a760d](https://github.com/City-of-Helsinki/yjdh/commit/a8a760d829c857a742da8b681f3bd2f434e3f150))
* **ks:** Add missing and fix wrong favicons ([0d116d0](https://github.com/City-of-Helsinki/yjdh/commit/0d116d0054b160abca1e6fede0c34404ef9e28f8))
* **ks:** Avoid querying backend when status filter is empty ([440b235](https://github.com/City-of-Helsinki/yjdh/commit/440b235ddfaf40442b1b50ae3a2b8d42a1f22d58))
* **ks:** Fix employer application list initial sorting mismatch ([b4eb10d](https://github.com/City-of-Helsinki/yjdh/commit/b4eb10d4fc9295c00a4e0ecb069dcaa0d86b0cbe))
* **ks:** Ordering, serializer, locale, and query typing ([ff9566e](https://github.com/City-of-Helsinki/yjdh/commit/ff9566ee4591df037e9c8286bf1f67bf34002a5b))
* Resolve application sorting, serialization, and UI rendering bugs ([ff9566e](https://github.com/City-of-Helsinki/yjdh/commit/ff9566ee4591df037e9c8286bf1f67bf34002a5b))


### Documentation

* **ks,handler:** Establish architectural docs and configurations ([e9e0e71](https://github.com/City-of-Helsinki/yjdh/commit/e9e0e71939ecb06655910affe27c770dc33ef24c))

## [2.2.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v2.1.0...kesaseteli-handler-v2.2.0) (2026-06-11)


### Features

* **ks,handler:** Allow unauthorized access to cookie settings ([a5682a0](https://github.com/City-of-Helsinki/yjdh/commit/a5682a00c6b07c1861e98b26e822f566d9f08113))
* **ks,handler:** Integrate matomo to handler UI ([a71fc01](https://github.com/City-of-Helsinki/yjdh/commit/a71fc0193c1f81fe3c255529bcb91adf36286839))


### Bug Fixes

* **ks,shared:** Fix ESLint errors in Matomo-related files ([e947011](https://github.com/City-of-Helsinki/yjdh/commit/e947011dbb65223699c9e93b8317a01a47324329))
* **ks:** Align route checks & fix test types ([62f19d3](https://github.com/City-of-Helsinki/yjdh/commit/62f19d3a5d8edce4cb5ac8a2eadc67681b4e5cf3))


### Dependencies

* **ks,shared:** Upgrade direct dependencies for security ([c7bd7af](https://github.com/City-of-Helsinki/yjdh/commit/c7bd7af3effcbc7e9cc4cb5a22d73cdd0973a48e))
* **ks:** Upgrade Sentry to v10 ([b269101](https://github.com/City-of-Helsinki/yjdh/commit/b269101eed021836b3dc23f82667d81ec2a72eda))
* **shared:** Upgrade nextjs to secure version 15.5.19 ([35e894b](https://github.com/City-of-Helsinki/yjdh/commit/35e894b33940c1477ea4e429eff9809ac801dc3d))


### Documentation

* **ks,shared:** Update useMatomo docs and test description ([b1a259c](https://github.com/City-of-Helsinki/yjdh/commit/b1a259c2c46b8c4eef4bf12133e029bd0ee6562e))

## [2.1.0](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v2.0.1...kesaseteli-handler-v2.1.0) (2026-05-27)


### Features

* **ks,handler:** Bump hds-react to 5.0.0 in Kesaseteli handler UI ([b110b8a](https://github.com/City-of-Helsinki/yjdh/commit/b110b8ad009cb2febe64c9f48520b154618f6993))


### Bug Fixes

* **shared-modal:** Use Extract for dialog-compatible variants ([7e1855d](https://github.com/City-of-Helsinki/yjdh/commit/7e1855d35298de8d8a61eaf3e38890b20860c40c))

## [2.0.1](https://github.com/City-of-Helsinki/yjdh/compare/kesaseteli-handler-v2.0.0...kesaseteli-handler-v2.0.1) (2026-05-18)


### Bug Fixes

* **ks:** Generate readme for youth UI and handlers UI ([832c569](https://github.com/City-of-Helsinki/yjdh/commit/832c5692777388c6db0b36014dc81c1e9c38f509))

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
