# Changelog

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
