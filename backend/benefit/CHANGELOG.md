# Changelog

## [2.9.7](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.6...benefit-backend-v2.9.7) (2025-10-13)


### Dependencies

* **benefit:** Drop ruff and pre-commit from requirements-dev ([716fe6f](https://github.com/City-of-Helsinki/yjdh/commit/716fe6f782e2b377ffb4ef9e3c110f652a00cbcb))
* **benefit:** Replace black, flake8 and isort with ruff ([798acbc](https://github.com/City-of-Helsinki/yjdh/commit/798acbc55bfa846017b3b257fd97ef57f90ea587))
* **deps:** Bump django from 4.2.24 to 4.2.25 in /backend/benefit ([0b5d76c](https://github.com/City-of-Helsinki/yjdh/commit/0b5d76c8323817747b0554a979adf8f57797cd70))
* Replace black, flake8 and isort with ruff in pre-commit ([6f7c1f1](https://github.com/City-of-Helsinki/yjdh/commit/6f7c1f1fd955a2d1230abf6b98ee93d9f09bbaab))


### Documentation

* **benefit:** Update documentation on code format ([e6cdef1](https://github.com/City-of-Helsinki/yjdh/commit/e6cdef1b40919dd1a9b96ef957090889829ca318))

## [2.9.6](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.5...benefit-backend-v2.9.6) (2025-09-25)


### Bug Fixes

* Postgres database to use database url + password combination ([7e539d0](https://github.com/City-of-Helsinki/yjdh/commit/7e539d0a4872f194d414c24da4386475fcf1e7b3))

## [2.9.5](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.4...benefit-backend-v2.9.5) (2025-09-11)


### Dependencies

* **deps:** Bump django from 4.2.11 to 4.2.24 in /backend/benefit ([fd00ce6](https://github.com/City-of-Helsinki/yjdh/commit/fd00ce6e14c142b5792ca6d95b4eb1842b4c0d35))

## [2.9.4](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.3...benefit-backend-v2.9.4) (2025-06-10)


### Bug Fixes

* **benefit:** Catch empty ahjo response and log it ([b98a90e](https://github.com/City-of-Helsinki/yjdh/commit/b98a90ee33864eb5572f38ecdccd32935f34b51b))

## [2.9.3](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.2...benefit-backend-v2.9.3) (2025-03-13)


### Bug Fixes

* **benefit:** Remove year from the application title ([#3667](https://github.com/City-of-Helsinki/yjdh/issues/3667)) ([55adb5a](https://github.com/City-of-Helsinki/yjdh/commit/55adb5ab620050bf96e5737c60aa3a26e7a8a2ac))

## [2.9.2](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.1...benefit-backend-v2.9.2) (2024-12-19)


### Bug Fixes

* Issues with 2nd instalment not showing up in frontpage ([#3661](https://github.com/City-of-Helsinki/yjdh/issues/3661)) ([ee39926](https://github.com/City-of-Helsinki/yjdh/commit/ee39926333de4c0ff88369ca6d8090baebe569fe))

## [2.9.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.9.0...benefit-backend-v2.9.1) (2024-12-17)


### Bug Fixes

* App and batch status updates after talpa fail ([#3656](https://github.com/City-of-Helsinki/yjdh/issues/3656)) ([b521df4](https://github.com/City-of-Helsinki/yjdh/commit/b521df47ec1c71950b32fd158613df07220ee23e))
* Missing return statement for instalment number 2 ([43ef665](https://github.com/City-of-Helsinki/yjdh/commit/43ef665ffcbdeffad10e6afd3e78c095d75bdca5))
* Should archive always if only 1 payment is done ([2a72155](https://github.com/City-of-Helsinki/yjdh/commit/2a721555b39775ca1881f7fbfb0d094ad7ab2dfc))
* Wrong condition, should check instalments count ([c33d293](https://github.com/City-of-Helsinki/yjdh/commit/c33d29396d81777b199e96cc118ba9af302ca9ab))

## [2.9.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.8.0...benefit-backend-v2.9.0) (2024-12-17)


### Features

* Delete applications older than 10 years ([#3646](https://github.com/City-of-Helsinki/yjdh/issues/3646)) ([d6cabc4](https://github.com/City-of-Helsinki/yjdh/commit/d6cabc4d4e272b20c4fb2ca97f0f2b45c66a47bc))
* Hl 1573 maintenance improvements ([#3650](https://github.com/City-of-Helsinki/yjdh/issues/3650)) ([192dc77](https://github.com/City-of-Helsinki/yjdh/commit/192dc770dd57a613bc31734287d07fab8d8c051a))
* Hl 1575 instalment to accepted ([#3642](https://github.com/City-of-Helsinki/yjdh/issues/3642)) ([9981a73](https://github.com/City-of-Helsinki/yjdh/commit/9981a73f2626473cdc3c960a1b8f7b4e2ae1f87e))
* Save missing version_series_id error ([#3641](https://github.com/City-of-Helsinki/yjdh/issues/3641)) ([3889847](https://github.com/City-of-Helsinki/yjdh/commit/38898479d2094bcfd13a60d66928225a61d414c1))
* Ui to recover from first instalment talpa error (hl-1582) ([#3654](https://github.com/City-of-Helsinki/yjdh/issues/3654)) ([801797f](https://github.com/City-of-Helsinki/yjdh/commit/801797f6e717ebf5b1370903e45692a9d9344302))


### Bug Fixes

* In application cloning force origin to be applicant ([#3653](https://github.com/City-of-Helsinki/yjdh/issues/3653)) ([7ec0dd9](https://github.com/City-of-Helsinki/yjdh/commit/7ec0dd9746161a2bdfb550504cb903f2694842a8))
* Issues with addtional_information_required (hl-1566) ([#3649](https://github.com/City-of-Helsinki/yjdh/issues/3649)) ([3aa9281](https://github.com/City-of-Helsinki/yjdh/commit/3aa92816c4f06e7206dffd9603b9890ef31686ee))
* Round alteration recovery amount down ([#3648](https://github.com/City-of-Helsinki/yjdh/issues/3648)) ([ddd8c1e](https://github.com/City-of-Helsinki/yjdh/commit/ddd8c1e46239cc18c5279392d373b60141e1e473))

## [2.8.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.7.0...benefit-backend-v2.8.0) (2024-12-09)


### Features

* 2nd instalment due date into csv ([#3635](https://github.com/City-of-Helsinki/yjdh/issues/3635)) ([f9bbaf9](https://github.com/City-of-Helsinki/yjdh/commit/f9bbaf964d0e750db8ed93d22936a050271d6869))
* Hl 1498 talpa errors ([#3620](https://github.com/City-of-Helsinki/yjdh/issues/3620)) ([47307a6](https://github.com/City-of-Helsinki/yjdh/commit/47307a6eeadfd0661258d70e8d4822d873ff9205))
* Hl 1502 csv changes ([#3618](https://github.com/City-of-Helsinki/yjdh/issues/3618)) ([b581dc3](https://github.com/City-of-Helsinki/yjdh/commit/b581dc3e1d6b5d55e3310a33d212bac64b23528c))
* HL 1559 signer api ([#3602](https://github.com/City-of-Helsinki/yjdh/issues/3602)) ([1e1f71d](https://github.com/City-of-Helsinki/yjdh/commit/1e1f71db168ce7050e0aa839f0fb48bf8e8e3369))
* New command for ending benefit periods ([#3564](https://github.com/City-of-Helsinki/yjdh/issues/3564)) ([96dd4f3](https://github.com/City-of-Helsinki/yjdh/commit/96dd4f3902d1c05aaa5ebafd0534bf71d3170ec8))
* Talpa CB batch and application talpa_status ([#3621](https://github.com/City-of-Helsinki/yjdh/issues/3621)) ([452d526](https://github.com/City-of-Helsinki/yjdh/commit/452d52671c33bb326693143f8f341ac7382b6db8))
* Update amount_paid after talpa CB success ([#3636](https://github.com/City-of-Helsinki/yjdh/issues/3636)) ([97ab04a](https://github.com/City-of-Helsinki/yjdh/commit/97ab04ab5d0d16aa04432c1aa89f7fc111892f7e))


### Bug Fixes

* Hl 1549 xml exception ([#3607](https://github.com/City-of-Helsinki/yjdh/issues/3607)) ([c8884fb](https://github.com/City-of-Helsinki/yjdh/commit/c8884fbbc50105222d4d7356bd1a64a297323aff))
* Token expiry based on refresh token expiry ([#3603](https://github.com/City-of-Helsinki/yjdh/issues/3603)) ([2579ed2](https://github.com/City-of-Helsinki/yjdh/commit/2579ed2bc8f801bc0b4cf9c1363963823ef705e7))
* Update only 1st instalment after decision cb ([#3637](https://github.com/City-of-Helsinki/yjdh/issues/3637)) ([8822819](https://github.com/City-of-Helsinki/yjdh/commit/88228193d0d85e57c78337b74b40e5e9c6ff197a))

## [2.7.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.6.0...benefit-backend-v2.7.0) (2024-11-26)


### Features

* Add two calculation and application fields as notes (hl-1550) ([#3549](https://github.com/City-of-Helsinki/yjdh/issues/3549)) ([823e5cd](https://github.com/City-of-Helsinki/yjdh/commit/823e5cd5c745a88b9bce916a14183f9b96a1641b))
* HL 1426 ahjo signer ([#3540](https://github.com/City-of-Helsinki/yjdh/issues/3540)) ([a4479bf](https://github.com/City-of-Helsinki/yjdh/commit/a4479bf7da77a74b4e6cf7b0cdb665d5f425d476))
* Visualise instalments and alterations (hl-1496) ([#3547](https://github.com/City-of-Helsinki/yjdh/issues/3547)) ([f56e581](https://github.com/City-of-Helsinki/yjdh/commit/f56e5813a178b6aa89d38fc27e7300b9e6db6169))


### Bug Fixes

* 1st instalment status accepted when created ([#3543](https://github.com/City-of-Helsinki/yjdh/issues/3543)) ([7f4e4aa](https://github.com/City-of-Helsinki/yjdh/commit/7f4e4aaf1a4c700f63a3f15338eaf14daf1a7d7d))
* Hl 1556 csv report ([#3544](https://github.com/City-of-Helsinki/yjdh/issues/3544)) ([d3caae5](https://github.com/City-of-Helsinki/yjdh/commit/d3caae57748ed0ada61b4a585eda90dfaa71047f))
* HL 1558 ahjo fixes ([#3565](https://github.com/City-of-Helsinki/yjdh/issues/3565)) ([0ea3745](https://github.com/City-of-Helsinki/yjdh/commit/0ea3745446eac85e1b269bc5724ec6c4cb0b351c))
* Quotes crashing talpa csv ([#3593](https://github.com/City-of-Helsinki/yjdh/issues/3593)) ([6a5715a](https://github.com/City-of-Helsinki/yjdh/commit/6a5715a0bb8d2b8e3ce8fecf7a0232f30e636d59))
* Various cloning issues (hl-1539) ([#3577](https://github.com/City-of-Helsinki/yjdh/issues/3577)) ([9c4f4ea](https://github.com/City-of-Helsinki/yjdh/commit/9c4f4ea7306cabf10503046c8393e349ab7b1f38))

## [2.6.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.5.0...benefit-backend-v2.6.0) (2024-11-12)


### Features

* Add accordion to decision box to list instalments (hl-1497) ([#3515](https://github.com/City-of-Helsinki/yjdh/issues/3515)) ([34e6201](https://github.com/City-of-Helsinki/yjdh/commit/34e620124426afbfd232e73eb88c46de0b7d6d15))
* Don't create new status on retry, save error ([#3526](https://github.com/City-of-Helsinki/yjdh/issues/3526)) ([1c2d9e4](https://github.com/City-of-Helsinki/yjdh/commit/1c2d9e4f8c04199cfb9940ab03aeac0ce8aef2f4))
* Implement instalments gui for handler (hl-1494) ([#3498](https://github.com/City-of-Helsinki/yjdh/issues/3498)) ([aaff375](https://github.com/City-of-Helsinki/yjdh/commit/aaff375519aa7f7defd8ede4beceaae96352982c))
* Use own endpoint for requesting more information ([#3523](https://github.com/City-of-Helsinki/yjdh/issues/3523)) ([18406f6](https://github.com/City-of-Helsinki/yjdh/commit/18406f66e6b8dd3826ee63570f4140b5556522ea))


### Bug Fixes

* Attachment date in add records & update reqs ([#3525](https://github.com/City-of-Helsinki/yjdh/issues/3525)) ([af635c0](https://github.com/City-of-Helsinki/yjdh/commit/af635c04b7c2eaf0fc498d2797b13e31bf56efb4))
* HL-1544 ([#3500](https://github.com/City-of-Helsinki/yjdh/issues/3500)) ([0b49eb3](https://github.com/City-of-Helsinki/yjdh/commit/0b49eb3c3b17bf0031369a04062c68ba83a56c92))
* Preselect decision maker if it was selected before (hl-1530) ([#3522](https://github.com/City-of-Helsinki/yjdh/issues/3522)) ([45095c5](https://github.com/City-of-Helsinki/yjdh/commit/45095c53a41f3bbf7101effe34b6aac44c2a06c3))

## [2.5.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.4.1...benefit-backend-v2.5.0) (2024-11-04)


### Features

* Create instalments when calculating benefit ([#3479](https://github.com/City-of-Helsinki/yjdh/issues/3479)) ([f9822b4](https://github.com/City-of-Helsinki/yjdh/commit/f9822b43029e1f9b5846ae85e2dbd2fc21e10fab))
* Don't block ahjo requests if xml build fails ([#3463](https://github.com/City-of-Helsinki/yjdh/issues/3463)) ([8a03c49](https://github.com/City-of-Helsinki/yjdh/commit/8a03c495042711e1c242480f0271053392666b5c))
* Fix issues with applicant changes (hl-1222) ([#3440](https://github.com/City-of-Helsinki/yjdh/issues/3440)) ([3610df9](https://github.com/City-of-Helsinki/yjdh/commit/3610df9c52a0a2eb9579e35fb9a632afb98409ce))
* Instalment model ([#3467](https://github.com/City-of-Helsinki/yjdh/issues/3467)) ([bd48949](https://github.com/City-of-Helsinki/yjdh/commit/bd489495b139aaa4ec950a01e265dfb7e188a3c4))
* New max benefit per month ([#3471](https://github.com/City-of-Helsinki/yjdh/issues/3471)) ([e5fc8a2](https://github.com/City-of-Helsinki/yjdh/commit/e5fc8a2e86e042cf37fa289efc24a5ec953f51bb))
* Separate credentials for PowerBI ([#3472](https://github.com/City-of-Helsinki/yjdh/issues/3472)) ([1e61b44](https://github.com/City-of-Helsinki/yjdh/commit/1e61b4489b8352493fc706403a27e62dc7684156))


### Bug Fixes

* Clone application fixes for attachments and status change (hl-1511) ([#3445](https://github.com/City-of-Helsinki/yjdh/issues/3445)) ([dad6a9d](https://github.com/City-of-Helsinki/yjdh/commit/dad6a9d2fb16a514531ec8c961a448e9062fa399))
* Modified_at date for ahjo update request ([#3452](https://github.com/City-of-Helsinki/yjdh/issues/3452)) ([d502a59](https://github.com/City-of-Helsinki/yjdh/commit/d502a59198c3965f377d16d4161768420da7f9d8))
* Repair some app crashing bugs when drafting the decision proposal (hl-1522) ([#3478](https://github.com/City-of-Helsinki/yjdh/issues/3478)) ([4cb17ac](https://github.com/City-of-Helsinki/yjdh/commit/4cb17ac7fadedbdd308e41eae44cfe390f400a98))
* Text improvements & added localizations (Hl-1425 & HL-1486) ([#3451](https://github.com/City-of-Helsinki/yjdh/issues/3451)) ([6105923](https://github.com/City-of-Helsinki/yjdh/commit/6105923d44818a3ddf32c787f206ba45d1a7f429))

## [2.4.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.4.0...benefit-backend-v2.4.1) (2024-10-23)


### Bug Fixes

* Resolve issues in alteration sum for the applicant (hl-1504 cont.) ([#3446](https://github.com/City-of-Helsinki/yjdh/issues/3446)) ([09ff6c0](https://github.com/City-of-Helsinki/yjdh/commit/09ff6c0cabc1c1aba1f6424e5f140344ff3d7753))
* Use company.name instead of app.company_name ([#3449](https://github.com/City-of-Helsinki/yjdh/issues/3449)) ([2b697b3](https://github.com/City-of-Helsinki/yjdh/commit/2b697b320d1e41fccd1cc74f6e8d84e7215a58b5))

## [2.4.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.3.1...benefit-backend-v2.4.0) (2024-10-16)


### Features

* Add ahjo errors to handler's application lists (hl-1421) ([#3289](https://github.com/City-of-Helsinki/yjdh/issues/3289)) ([ddb4fe4](https://github.com/City-of-Helsinki/yjdh/commit/ddb4fe44b7453c5d2a8ed1974107096e2bc86d9f))
* Add ahjo validation error message ([#3410](https://github.com/City-of-Helsinki/yjdh/issues/3410)) ([d7c6ee4](https://github.com/City-of-Helsinki/yjdh/commit/d7c6ee4ef32000e6e023b0a808138484f67f9df7))
* Add talpa status and decision date to apps which are "in payment" state ([#3444](https://github.com/City-of-Helsinki/yjdh/issues/3444)) ([3fd9088](https://github.com/City-of-Helsinki/yjdh/commit/3fd908882ef32a403f64a89f7d5c3e433d34ca3c))
* Clone application on applicant side (hl-1447) ([#3324](https://github.com/City-of-Helsinki/yjdh/issues/3324)) ([9bd626f](https://github.com/City-of-Helsinki/yjdh/commit/9bd626fb66521e90b5d6e70a7d14366d78874309))
* Clone entire application (hl-1464) ([#3369](https://github.com/City-of-Helsinki/yjdh/issues/3369)) ([26051e4](https://github.com/City-of-Helsinki/yjdh/commit/26051e4935f3ba0c752ec805972a3f930f163ac0))
* Csv for powerBI integration ([#3327](https://github.com/City-of-Helsinki/yjdh/issues/3327)) ([e061288](https://github.com/City-of-Helsinki/yjdh/commit/e0612883119997333dd90cba356e6e81be9d76c8))
* Ensure ahjo_status is saved during  request ([#3380](https://github.com/City-of-Helsinki/yjdh/issues/3380)) ([f2e9c37](https://github.com/City-of-Helsinki/yjdh/commit/f2e9c3730a3e6f8ec49cbaa1422c1704fdc2f903))
* Find related applications for a single employee (hl-1354) ([#3321](https://github.com/City-of-Helsinki/yjdh/issues/3321)) ([c0dc2e7](https://github.com/City-of-Helsinki/yjdh/commit/c0dc2e7ef1dbff6968481a2e26f9e28b2c38761f))
* Hl 1134 ([#3239](https://github.com/City-of-Helsinki/yjdh/issues/3239)) decionMaker from ahjo API ([ac1a6df](https://github.com/City-of-Helsinki/yjdh/commit/ac1a6df0a58aedd046daa1a3ed0457cab98dc9c3))
* HL 1440 & HL 1441 set archived status & talpa_status for applications ([#3236](https://github.com/City-of-Helsinki/yjdh/issues/3236)) ([e1d80ac](https://github.com/City-of-Helsinki/yjdh/commit/e1d80ac25f0f10e32d510b0fe4e692ee8e13ee90))
* Hl 1445 add powerBI fields ([#3334](https://github.com/City-of-Helsinki/yjdh/issues/3334)) ([69a2421](https://github.com/City-of-Helsinki/yjdh/commit/69a24211d38ed390de11eaccbe885c663863bc03))
* HL 1453 ahjo retry and other fixes ([#3414](https://github.com/City-of-Helsinki/yjdh/issues/3414)) ([bfa6591](https://github.com/City-of-Helsinki/yjdh/commit/bfa65916c21341237bfd48bcca95610bd9be9015))
* HL 1460 ([#3305](https://github.com/City-of-Helsinki/yjdh/issues/3305)) ([1a7ca0c](https://github.com/City-of-Helsinki/yjdh/commit/1a7ca0c5e894da44523d3b78d5e0570d37d059b7))
* HL 1476 talpa improvements ([#3371](https://github.com/City-of-Helsinki/yjdh/issues/3371)) ([348aa31](https://github.com/City-of-Helsinki/yjdh/commit/348aa313944ea6c392904bae4d48e7db316a713e))
* Include attachment additions to change set (hl-1209) ([#3423](https://github.com/City-of-Helsinki/yjdh/issues/3423)) ([e33c704](https://github.com/City-of-Helsinki/yjdh/commit/e33c7045c50f73edfb791ef76f563f4121767367))
* Schedule decisionmaker request (Hl 1468) ([#3329](https://github.com/City-of-Helsinki/yjdh/issues/3329)) ([e64ad61](https://github.com/City-of-Helsinki/yjdh/commit/e64ad6194b299dac4ec60c74d3782164e8fcab2c))
* Store ahjo validation errors to ahjoStatus ([#3342](https://github.com/City-of-Helsinki/yjdh/issues/3342)) ([ef3e6cb](https://github.com/City-of-Helsinki/yjdh/commit/ef3e6cbffe24168993936e7c529a8e9b0b27db31))


### Bug Fixes

* Add an option to specify sheet, changes on import validation ([9a31f2e](https://github.com/City-of-Helsinki/yjdh/commit/9a31f2e32106e980c08034ef42498b2382e808e9))
* Add missing batch.status and ahjo_case_id to serializer ([ff80631](https://github.com/City-of-Helsinki/yjdh/commit/ff80631e9b7428b8eb332c3f3e94b64d22f038a8))
* Add SBOM to powerBI csv ([#3355](https://github.com/City-of-Helsinki/yjdh/issues/3355)) ([6ce299f](https://github.com/City-of-Helsinki/yjdh/commit/6ce299f4384fdd0ec6fb60db50112a7f22192d07))
* Application history did not include change reasons with 0 diffs (hl-1484) ([#3413](https://github.com/City-of-Helsinki/yjdh/issues/3413)) ([031d5bf](https://github.com/City-of-Helsinki/yjdh/commit/031d5bfee7ea4b6e330b13dc7e7c43dc62a3404f))
* Broken html to pdf layout in application print ([#3378](https://github.com/City-of-Helsinki/yjdh/issues/3378)) ([012302c](https://github.com/City-of-Helsinki/yjdh/commit/012302c81cdc2c1bf41aa26b0b506d763783ea9d))
* Conflict with _ as it was already defined ([9bb81d9](https://github.com/City-of-Helsinki/yjdh/commit/9bb81d93e97c105c0ff86bfd8ddd813f028fb755))
* Do not remove batch if ahjo automation ([#3381](https://github.com/City-of-Helsinki/yjdh/issues/3381)) ([57e5eca](https://github.com/City-of-Helsinki/yjdh/commit/57e5eca3f809519d9cd1a1f68ad5aa54300fa99f))
* Get or create non-existing decision draft object ([ad1f3e0](https://github.com/City-of-Helsinki/yjdh/commit/ad1f3e0bb0e728da62bba4324946e839b293380e))
* HL 1461 + HL 1466 fixes ([#3336](https://github.com/City-of-Helsinki/yjdh/issues/3336)) ([f140a59](https://github.com/City-of-Helsinki/yjdh/commit/f140a59661cfcf6e7c2c068a10fdc6b4bfcd090d))
* HL 1465 improve Ahjo callback error logging ([#3325](https://github.com/City-of-Helsinki/yjdh/issues/3325)) ([cadaa1b](https://github.com/City-of-Helsinki/yjdh/commit/cadaa1ba05f551bae306fa7eca0b05f7e652c4e6))
* HL-1478 xml error ([#3368](https://github.com/City-of-Helsinki/yjdh/issues/3368)) ([2b08d0c](https://github.com/City-of-Helsinki/yjdh/commit/2b08d0caeac7d7d2053c0576ec00bd6e27e599eb))
* Pdf_summary delete on application update ([#3356](https://github.com/City-of-Helsinki/yjdh/issues/3356)) ([508b66c](https://github.com/City-of-Helsinki/yjdh/commit/508b66ca3e9a9f9b7f6f162537642eafedfff6ba))
* Record title for add records request ([#3320](https://github.com/City-of-Helsinki/yjdh/issues/3320)) ([8c119f4](https://github.com/City-of-Helsinki/yjdh/commit/8c119f4d4eb91fc174a664923762bad44a8cbd0f))
* Remove unnecessary print and useEffect ([687f620](https://github.com/City-of-Helsinki/yjdh/commit/687f6202448bb3c43d2500d8b1b28b6cf073df0d))
* Retry command call and settings ([#3442](https://github.com/City-of-Helsinki/yjdh/issues/3442)) ([6882559](https://github.com/City-of-Helsinki/yjdh/commit/68825594414491e8b317728cc0af62fd2722adbb))
* Whitespace crash in alteration csv ([#3306](https://github.com/City-of-Helsinki/yjdh/issues/3306)) ([535794e](https://github.com/City-of-Helsinki/yjdh/commit/535794ea4e6ad9de0f49050b674a855a471f4880))

## [2.3.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.3.0...benefit-backend-v2.3.1) (2024-09-09)


### Bug Fixes

* Open case title limit to 150 chars ([#3292](https://github.com/City-of-Helsinki/yjdh/issues/3292)) ([1bfc1b2](https://github.com/City-of-Helsinki/yjdh/commit/1bfc1b28b3ac8ac2cf0d65a04f4c9fbef78b445e))

## [2.3.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.2.0...benefit-backend-v2.3.0) (2024-08-26)


### Features

* Add alteration count and state to archive listing ([#3198](https://github.com/City-of-Helsinki/yjdh/issues/3198)) ([09a645e](https://github.com/City-of-Helsinki/yjdh/commit/09a645e7a5b5be4638702d5ea639e2965a04e248))
* Add cancelled applications to delete request ([#3199](https://github.com/City-of-Helsinki/yjdh/issues/3199)) ([3820390](https://github.com/City-of-Helsinki/yjdh/commit/38203900f55be728d8ce1662b3c49b43d63c3293))
* Add unread messages notifier into header (hl-1410) ([#3214](https://github.com/City-of-Helsinki/yjdh/issues/3214)) ([56a47c3](https://github.com/City-of-Helsinki/yjdh/commit/56a47c304cd1ce866eee81779509ada4d0707f9d))
* Allow ahjo_status change in admin ([#3115](https://github.com/City-of-Helsinki/yjdh/issues/3115)) ([226ad18](https://github.com/City-of-Helsinki/yjdh/commit/226ad18375e0de6f5fbf5886742db47e747d9435))
* Allow handler to mark last application message as unread ([#3120](https://github.com/City-of-Helsinki/yjdh/issues/3120)) (HL-1117) ([79efe24](https://github.com/City-of-Helsinki/yjdh/commit/79efe243d59c113e51182363b7c8ed15029c21e0))
* Cancel batch after application cancel ([#3100](https://github.com/City-of-Helsinki/yjdh/issues/3100)) ([aff14ec](https://github.com/City-of-Helsinki/yjdh/commit/aff14ecbb5a322da1fd919260cc602227776d22b))
* Enqueue for ahjo deletion on cancellation ([#3092](https://github.com/City-of-Helsinki/yjdh/issues/3092)) ([19cea8c](https://github.com/City-of-Helsinki/yjdh/commit/19cea8c07708bdce3540eca9537af91f1d7ed413))
* Hide decisionSummary if details unreceived from ahjo ([#3216](https://github.com/City-of-Helsinki/yjdh/issues/3216)) ([ec07dd4](https://github.com/City-of-Helsinki/yjdh/commit/ec07dd4d97a8a375130ff4371afcdc4783eccf73))
* HL 1365 improve logging, HL-1363 don't block ahjo requests ([#3099](https://github.com/City-of-Helsinki/yjdh/issues/3099)) ([cb1cb45](https://github.com/City-of-Helsinki/yjdh/commit/cb1cb45d75a0f580739b4f64c90dc047890632cf))
* Logged in user to alteration csv ([#3223](https://github.com/City-of-Helsinki/yjdh/issues/3223)) ([15e1869](https://github.com/City-of-Helsinki/yjdh/commit/15e1869cb1b07ffc48dbaac31edf66d7ae9f5c3d))
* Offset application content when sidebar is open (hl-1200) ([#3189](https://github.com/City-of-Helsinki/yjdh/issues/3189)) ([c1e05a2](https://github.com/City-of-Helsinki/yjdh/commit/c1e05a2923916de27c1966b08feb034416eb8731))
* Truncate company name in open case request ([#3118](https://github.com/City-of-Helsinki/yjdh/issues/3118)) ([4b15459](https://github.com/City-of-Helsinki/yjdh/commit/4b1545950c9508d093ed42beb75cf81d2e1187a8))


### Bug Fixes

* Forgot the flag for handled_by_ahjo_automation for fixture ([6cee77e](https://github.com/City-of-Helsinki/yjdh/commit/6cee77ea8cc5ef79fc1393e2867470f1abcaa1da))
* HL-1191, HL-1405 , HL-1420 ([#3225](https://github.com/City-of-Helsinki/yjdh/issues/3225)) ([0eb0ee8](https://github.com/City-of-Helsinki/yjdh/commit/0eb0ee850de3feaca009b67244be7178935049cc))
* Loosen validation rules for new messages ([#3222](https://github.com/City-of-Helsinki/yjdh/issues/3222)) ([2512a8b](https://github.com/City-of-Helsinki/yjdh/commit/2512a8bdc25990d70c4e2c2b1c1ee487d57007c6))
* Missing delete_request_sent ahjo_status ([#3200](https://github.com/City-of-Helsinki/yjdh/issues/3200)) ([ab41393](https://github.com/City-of-Helsinki/yjdh/commit/ab41393d24d43d1e1486d5bd000032d04d14ef63))
* Over eager corporate name truncate ([#3219](https://github.com/City-of-Helsinki/yjdh/issues/3219)) ([f95cc66](https://github.com/City-of-Helsinki/yjdh/commit/f95cc662eccec523bebf8ed126e259ffbc553612))
* Remove comma from xml filenames ([#3193](https://github.com/City-of-Helsinki/yjdh/issues/3193)) ([381d7ba](https://github.com/City-of-Helsinki/yjdh/commit/381d7ba1c724b847325a1726b4515d4d3a8a21c4))
* Remove employee consent attachment limit to 1 ([#3221](https://github.com/City-of-Helsinki/yjdh/issues/3221)) ([94ba9e9](https://github.com/City-of-Helsinki/yjdh/commit/94ba9e96266ac99731b16d0047ac1458d73f8145))
* Reset a few values when apprenticeship or pay subsidy type is changed ([#3218](https://github.com/City-of-Helsinki/yjdh/issues/3218)) ([bed8592](https://github.com/City-of-Helsinki/yjdh/commit/bed859218d78d185d2aaf41bb219ae9129cd5c33))
* Resolve pip problems ([#3125](https://github.com/City-of-Helsinki/yjdh/issues/3125)) ([fb3742b](https://github.com/City-of-Helsinki/yjdh/commit/fb3742b2bab8b9f44154d7cb028b8b7d06010277))
* Sanitize filename and it's extension to Ahjo requirements ([#3187](https://github.com/City-of-Helsinki/yjdh/issues/3187)) ([cd70f6c](https://github.com/City-of-Helsinki/yjdh/commit/cd70f6c84a134dd97482875d4a0def958f6cd842))
* State aid max percentage was selected even though prop was null (hl-1185) ([#3207](https://github.com/City-of-Helsinki/yjdh/issues/3207)) ([a46fb10](https://github.com/City-of-Helsinki/yjdh/commit/a46fb1034ea480b4cc7cf8bd46b8b15b2087b15e))
* Trim the ahjo case title to 100 characters ([#3201](https://github.com/City-of-Helsinki/yjdh/issues/3201)) ([45fc384](https://github.com/City-of-Helsinki/yjdh/commit/45fc38454059e2353d1c57454747130edc08d685))
* Truncate corporateName to 100 chars ([#3213](https://github.com/City-of-Helsinki/yjdh/issues/3213)) ([6315278](https://github.com/City-of-Helsinki/yjdh/commit/63152780c2ac63437383de27560e57ca6b7e3527))

## [2.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.1.0...benefit-backend-v2.2.0) (2024-06-24)


### Features

* Add filters to search & improve spreadsheet import (hl-1322) ([#3090](https://github.com/City-of-Helsinki/yjdh/issues/3090)) ([b587b4c](https://github.com/City-of-Helsinki/yjdh/commit/b587b4c1f2dadbcea006c4732005beb471b43f6e))

## [2.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v2.0.0...benefit-backend-v2.1.0) (2024-06-17)


### Features

* Adjust title of ahjo application record ([#3030](https://github.com/City-of-Helsinki/yjdh/issues/3030)) ([0301827](https://github.com/City-of-Helsinki/yjdh/commit/0301827591d1ec441c859798b193a3318d81f4b5))
* **applicant:** Display chat icon in app view for statuses "accepted", "rejected" (hl-1292) ([#3046](https://github.com/City-of-Helsinki/yjdh/issues/3046)) ([fe856be](https://github.com/City-of-Helsinki/yjdh/commit/fe856bea20fbdc890d2f8cc57cd0f504b0d216a7))
* Cancelled status after ahjo delete callback ([#3078](https://github.com/City-of-Helsinki/yjdh/issues/3078)) ([128fae4](https://github.com/City-of-Helsinki/yjdh/commit/128fae47e2c930ad4373d51150cee5eae402d94c))
* Change failure response to ahjo as 200 ok ([#3054](https://github.com/City-of-Helsinki/yjdh/issues/3054)) ([8f9b5ac](https://github.com/City-of-Helsinki/yjdh/commit/8f9b5ac9d736ec09bc5d325e504a55459a78f0da))
* **handler:** Add seen by applicant in the messaging bar ([#2989](https://github.com/City-of-Helsinki/yjdh/issues/2989)) ([c4eca38](https://github.com/City-of-Helsinki/yjdh/commit/c4eca38e2f0b7f609d61493392fefd7beb9d817a))
* Implement search feature and GUI to handler's archive (hl-684) ([#3039](https://github.com/City-of-Helsinki/yjdh/issues/3039)) ([fe9112f](https://github.com/City-of-Helsinki/yjdh/commit/fe9112f0c5f612b8c65b990cc210ca2d95d2fbcc))
* Implement the app page components for alterations for handler (HL-1247) ([#2982](https://github.com/City-of-Helsinki/yjdh/issues/2982)) ([ffaee28](https://github.com/City-of-Helsinki/yjdh/commit/ffaee289177fb29e38b2e5bf7c107bbfa1d2826f))
* Import old applications from spreadsheet file (hl-1310) ([#3056](https://github.com/City-of-Helsinki/yjdh/issues/3056)) ([0302394](https://github.com/City-of-Helsinki/yjdh/commit/030239460de752ad03c7aed4d1f1c525449035fc))
* Run ahjo decision details requests hourly ([#3049](https://github.com/City-of-Helsinki/yjdh/issues/3049)) ([a3f56d9](https://github.com/City-of-Helsinki/yjdh/commit/a3f56d96d134664bb0d1b23af7977b95425b6570))
* Schedule Ahjo case delete ([#3064](https://github.com/City-of-Helsinki/yjdh/issues/3064)) ([392d7c8](https://github.com/City-of-Helsinki/yjdh/commit/392d7c8ca9fc51153f182a2c1adcaaa488332fb5))
* Show de minimis status in the decision box for applicant ([#3085](https://github.com/City-of-Helsinki/yjdh/issues/3085)) (HL-1266) ([e511717](https://github.com/City-of-Helsinki/yjdh/commit/e5117172964d8635c40a98e50a054339898a7407))
* Update  ahjo status after decision details request success ([#3059](https://github.com/City-of-Helsinki/yjdh/issues/3059)) ([7a7bb2c](https://github.com/City-of-Helsinki/yjdh/commit/7a7bb2c332389e0170b98840055af9c313bdf602))


### Bug Fixes

* Add missing tags when saving decision text ([#2987](https://github.com/City-of-Helsinki/yjdh/issues/2987)) ([c8372a9](https://github.com/City-of-Helsinki/yjdh/commit/c8372a94af42b185cee4c42194e7b359471a3db5))
* Batch in applicantApplication error ([#3062](https://github.com/City-of-Helsinki/yjdh/issues/3062)) ([86c52e8](https://github.com/City-of-Helsinki/yjdh/commit/86c52e8e2b976774ac8f8b66db7b71b51f0dba7b))
* En language in ahjo requests ([#3053](https://github.com/City-of-Helsinki/yjdh/issues/3053)) ([ee32a43](https://github.com/City-of-Helsinki/yjdh/commit/ee32a43ad92994b3b3f8b18e9bd0c3320e7b9887))
* Excluded full_application attachment ([#3081](https://github.com/City-of-Helsinki/yjdh/issues/3081)) ([2500943](https://github.com/City-of-Helsinki/yjdh/commit/2500943180fd2b635782dbed8d164c0c9fa046d7))
* Make ahjo_case_id read_only ([#3091](https://github.com/City-of-Helsinki/yjdh/issues/3091)) ([2e623ef](https://github.com/City-of-Helsinki/yjdh/commit/2e623efd412bc922b3eaeb9491ccd2ca42dafec3))
* Missing parameter for delete request query ([#3073](https://github.com/City-of-Helsinki/yjdh/issues/3073)) ([39fe7d1](https://github.com/City-of-Helsinki/yjdh/commit/39fe7d111ddc06f80f0b15d63c6d86c99e761e21))
* Move cancelled applications to archive page ([#3079](https://github.com/City-of-Helsinki/yjdh/issues/3079)) (HL-1321) ([9e0c05d](https://github.com/City-of-Helsinki/yjdh/commit/9e0c05d504c3325309872a1de9b9641d67e45571))
* No calculation data for rejected applications ([#3080](https://github.com/City-of-Helsinki/yjdh/issues/3080)) ([7f7f96d](https://github.com/City-of-Helsinki/yjdh/commit/7f7f96d8a6346a8b8689c4c361b0e3d53affacb5))
* Nonfunctional alteration submission and misc. oversights in date overlap detection ([#3068](https://github.com/City-of-Helsinki/yjdh/issues/3068)) ([9e7dfb9](https://github.com/City-of-Helsinki/yjdh/commit/9e7dfb907e6a69031a9a5bfa98e6f1b61ed7ed4e))
* Overwritten test variable ([#3066](https://github.com/City-of-Helsinki/yjdh/issues/3066)) ([7c4ad63](https://github.com/City-of-Helsinki/yjdh/commit/7c4ad634f81bed3ce2d392ce7dd91331b2d33ab9))
* Prefetch alterations regardless of auth mock flag ([#3043](https://github.com/City-of-Helsinki/yjdh/issues/3043)) ([721dd43](https://github.com/City-of-Helsinki/yjdh/commit/721dd43d45ffa8102612a41770d1ae239ec30bc8))
* Query handled applications for open case ([#3051](https://github.com/City-of-Helsinki/yjdh/issues/3051)) ([62f45d7](https://github.com/City-of-Helsinki/yjdh/commit/62f45d737d90cc6af27af08280da42ecb488a547))
* Return missing admin fields ([#3071](https://github.com/City-of-Helsinki/yjdh/issues/3071)) ([988034a](https://github.com/City-of-Helsinki/yjdh/commit/988034a66398c28cf4b03914ca395a866d74ad3f))
* Send decision also after new records are sent ([#3063](https://github.com/City-of-Helsinki/yjdh/issues/3063)) ([c316246](https://github.com/City-of-Helsinki/yjdh/commit/c3162464840dd5cf59e012f53ab3775008038742))
* Small code style fix ([#3037](https://github.com/City-of-Helsinki/yjdh/issues/3037)) ([0fb579c](https://github.com/City-of-Helsinki/yjdh/commit/0fb579c6ecede9ce989486ba737fb69ee46f076f))

## [2.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.13.0...benefit-backend-v2.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* **backend:** handler is assigned to applicant user if additional information is submitted

### Features

* Api endpoint for ahjo delete ([#2961](https://github.com/City-of-Helsinki/yjdh/issues/2961)) ([e5e3240](https://github.com/City-of-Helsinki/yjdh/commit/e5e3240332f763718e0d84a5dbd0d6ad9b7318bd))
* Callback endpoint for decision status ([#2977](https://github.com/City-of-Helsinki/yjdh/issues/2977)) ([3e72d40](https://github.com/City-of-Helsinki/yjdh/commit/3e72d404db3a793682dd9272031fa6f0db74a6ad))


### Bug Fixes

* **backend:** Handler is assigned to applicant user if additional information is submitted ([bb7b280](https://github.com/City-of-Helsinki/yjdh/commit/bb7b280c6717bf7cda2e2f5d861c703a5fbeffa4))

## [1.13.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.12.0...benefit-backend-v1.13.0) (2024-05-14)


### Features

* Add ahjo_status to Django admin ([#2955](https://github.com/City-of-Helsinki/yjdh/issues/2955)) ([148b15f](https://github.com/City-of-Helsinki/yjdh/commit/148b15f451330e0e8a774207984d7742e65eeda6))
* Cast row amounts to integers ([#2953](https://github.com/City-of-Helsinki/yjdh/issues/2953)) ([dee7db9](https://github.com/City-of-Helsinki/yjdh/commit/dee7db9f28ccf59c0ff265b960a667708df13372))
* Enhance error notifications when uploading malformed or malwared file (hl-1267) ([#2973](https://github.com/City-of-Helsinki/yjdh/issues/2973)) ([cd61403](https://github.com/City-of-Helsinki/yjdh/commit/cd614030233cf69b36e49a23869d82be4aa9b776))
* Implement received alterations page for handlers (HL-1246) ([#2947](https://github.com/City-of-Helsinki/yjdh/issues/2947)) ([850b364](https://github.com/City-of-Helsinki/yjdh/commit/850b364fdc756d773a2c57f32b716a9201080d43))
* Introduce handler lock to edits (hl-1149) ([#2945](https://github.com/City-of-Helsinki/yjdh/issues/2945)) ([f116b32](https://github.com/City-of-Helsinki/yjdh/commit/f116b32746a5f0a84f61d24efdcd83787a4d613b))
* Prepare handler application index for new ahjo integration (hl-1278) ([#2958](https://github.com/City-of-Helsinki/yjdh/issues/2958)) ([1ad52cf](https://github.com/City-of-Helsinki/yjdh/commit/1ad52cfb09f8145944e930fcac0e1bbdf1203256))
* Remove date from application record title ([#2963](https://github.com/City-of-Helsinki/yjdh/issues/2963)) ([2683210](https://github.com/City-of-Helsinki/yjdh/commit/2683210c49a1244e92db50cc53c6b5b88826efb2))


### Bug Fixes

* Do not show cents for benefit amount (hl-1294) ([#2971](https://github.com/City-of-Helsinki/yjdh/issues/2971)) ([2e7806b](https://github.com/City-of-Helsinki/yjdh/commit/2e7806b747d437c8c6130e83429d03b0afb72e95))
* Enable justification text variable replacement ([#2959](https://github.com/City-of-Helsinki/yjdh/issues/2959)) ([b7b4f79](https://github.com/City-of-Helsinki/yjdh/commit/b7b4f79e1cd562af4c2338828b7fcd89e75d774e))
* Filter batches using auto_generated_by_ahjo value ([d27d5cc](https://github.com/City-of-Helsinki/yjdh/commit/d27d5ccb84bf5646f507c0fcca2a0085d0ef3e5e))
* Filter batches using auto_generated_by_ahjo value (hl-1304) ([#2979](https://github.com/City-of-Helsinki/yjdh/issues/2979)) ([f6a8c64](https://github.com/City-of-Helsinki/yjdh/commit/f6a8c64b759df6e5f2bcee9c22abc19a0c4eeefd))
* **handler:** Archived page to show cancelled applications (hl-1287) ([#2951](https://github.com/City-of-Helsinki/yjdh/issues/2951)) ([b1c2930](https://github.com/City-of-Helsinki/yjdh/commit/b1c2930ff2f5d8f75d276e9dbd62944a630476cf))
* Ignore paper apps, correct date to email template ([#2960](https://github.com/City-of-Helsinki/yjdh/issues/2960)) ([1dbf1da](https://github.com/City-of-Helsinki/yjdh/commit/1dbf1da6fdd431be5574568f80d76b92883acfbf))
* Query for the undownloaded attachments ([#2983](https://github.com/City-of-Helsinki/yjdh/issues/2983)) ([b01d039](https://github.com/City-of-Helsinki/yjdh/commit/b01d039642e3876ce38ada581980e09a8cf11228))
* Send ahjo_version_series_id in update payload ([#2984](https://github.com/City-of-Helsinki/yjdh/issues/2984)) ([a2136f1](https://github.com/City-of-Helsinki/yjdh/commit/a2136f15c11ceed46f660b5a88d9f60966cde80b))
* Total amount as int ([#2975](https://github.com/City-of-Helsinki/yjdh/issues/2975)) ([d3a346d](https://github.com/City-of-Helsinki/yjdh/commit/d3a346d24583c72a789c91539849c6bf208a405c))

## [1.12.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.11.0...benefit-backend-v1.12.0) (2024-04-19)


### Features

* ClamAV malware scanning for attachments ([#2894](https://github.com/City-of-Helsinki/yjdh/issues/2894)) ([56e640b](https://github.com/City-of-Helsinki/yjdh/commit/56e640bbd5a53dd2401e61b6f1d719a85b248b27))
* Implement new Ahjo process UI for handler (HL-1167) ([8f3d591](https://github.com/City-of-Helsinki/yjdh/commit/8f3d5914d4828b5f8985f88e7485a5be32a12e31))
* Implement the existing alteration list and alteration deletion for the applicant (HL-1154) ([#2925](https://github.com/City-of-Helsinki/yjdh/issues/2925)) ([aea007f](https://github.com/City-of-Helsinki/yjdh/commit/aea007f32f8620ac81417d7a2cf7d0556454e262))
* Used the shared ssn function for birthday ([#2941](https://github.com/City-of-Helsinki/yjdh/issues/2941)) ([84e7ca7](https://github.com/City-of-Helsinki/yjdh/commit/84e7ca78a31cb4b97c26fcf359185f0be60cc27a))


### Bug Fixes

* Failing ahjo token refresh ([#2926](https://github.com/City-of-Helsinki/yjdh/issues/2926)) ([065fdfb](https://github.com/City-of-Helsinki/yjdh/commit/065fdfbb3c1fa6ba0795526d087fe9d24ef319f3))
* Lowercase L in attachment title ([#2920](https://github.com/City-of-Helsinki/yjdh/issues/2920)) ([3ed504f](https://github.com/City-of-Helsinki/yjdh/commit/3ed504f956b625bdcd1c7a76e2655071fdf618c8))
* Show filename on change set when applicant adds a new file ([#2922](https://github.com/City-of-Helsinki/yjdh/issues/2922)) ([aa84b60](https://github.com/City-of-Helsinki/yjdh/commit/aa84b6060ef95ab973b01fa05b0e8e2fc3b90742))

## [1.11.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.10.0...benefit-backend-v1.11.0) (2024-04-04)


### Features

* Add decision details information box to application page ([aaf7794](https://github.com/City-of-Helsinki/yjdh/commit/aaf7794044057f17d1ed99c39f6301a5f2d6826f))
* Add localization for ahjo messages ([#2891](https://github.com/City-of-Helsinki/yjdh/issues/2891)) ([943be9d](https://github.com/City-of-Helsinki/yjdh/commit/943be9d2704ac09dfb3e51208a1cc104e67d1428))
* Configure AHJO request timeout via settings ([#2896](https://github.com/City-of-Helsinki/yjdh/issues/2896)) ([c1382ad](https://github.com/City-of-Helsinki/yjdh/commit/c1382ad67872af6ec127238ebe86b60bed0f38cc))
* Implement application alteration submission flow ([ebbe9e5](https://github.com/City-of-Helsinki/yjdh/commit/ebbe9e5fd2cb21ec457845e5fe16cdfa617e655a))
* Include alterations in application admin view ([#2898](https://github.com/City-of-Helsinki/yjdh/issues/2898)) ([bd08f18](https://github.com/City-of-Helsinki/yjdh/commit/bd08f186e79c0b82f82244989dd535ef28da2c97))
* Secret xml attachment as per the  new design ([#2899](https://github.com/City-of-Helsinki/yjdh/issues/2899)) ([733065b](https://github.com/City-of-Helsinki/yjdh/commit/733065bd5640e2470ee4cc6dd4a92e8c605f1d34))


### Bug Fixes

* Change default work time percentage from 100 to 65 ([#2900](https://github.com/City-of-Helsinki/yjdh/issues/2900)) ([78435bd](https://github.com/City-of-Helsinki/yjdh/commit/78435bd4daa642f12c8de4a968d3fc70407e406f))
* Defer accepted/rejected status until the decision has been accepted in Ahjo ([#2903](https://github.com/City-of-Helsinki/yjdh/issues/2903)) ([09b6340](https://github.com/City-of-Helsinki/yjdh/commit/09b63401a437fbab81c8699be0de001e4a706ac6))
* Flaky test because of unique username issue, reseed to address ([f6c786c](https://github.com/City-of-Helsinki/yjdh/commit/f6c786c58489cbaefd412293949587285782e8db))
* Justify th elements to the right ([#2912](https://github.com/City-of-Helsinki/yjdh/issues/2912)) ([3d8acbe](https://github.com/City-of-Helsinki/yjdh/commit/3d8acbeb072072a418f0a21f0c453b477b6f98e5))
* Missing query parameters for AHJO delete ([#2887](https://github.com/City-of-Helsinki/yjdh/issues/2887)) ([63c95f1](https://github.com/City-of-Helsinki/yjdh/commit/63c95f1e398126f2271e6d94f4fa13d962375976))
* Secret decision xml formatting ([#2902](https://github.com/City-of-Helsinki/yjdh/issues/2902)) ([3ffd311](https://github.com/City-of-Helsinki/yjdh/commit/3ffd3110fc040c13aa7353f436e1f27612ac14eb))
* Typo in Type ([#2888](https://github.com/City-of-Helsinki/yjdh/issues/2888)) ([f880842](https://github.com/City-of-Helsinki/yjdh/commit/f880842b726578b7d218fd6cc35d92a96b22ffcc))

## [1.10.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.9.0...benefit-backend-v1.10.0) (2024-03-15)


### Features

* Add decision texts to Django admin ([#2882](https://github.com/City-of-Helsinki/yjdh/issues/2882)) ([504a5a3](https://github.com/City-of-Helsinki/yjdh/commit/504a5a3d600d902eb44ca32a88b1c1aa54cd1a67))

## [1.9.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.8.0...benefit-backend-v1.9.0) (2024-03-15)


### Features

* Hl 1140 shorten ahjo title ([#2879](https://github.com/City-of-Helsinki/yjdh/issues/2879)) ([7f12022](https://github.com/City-of-Helsinki/yjdh/commit/7f12022f4186def5e752d7481d96869a7f30c114))

## [1.8.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.7.0...benefit-backend-v1.8.0) (2024-03-15)


### Features

* Add alteration notice API ([eb2fcf7](https://github.com/City-of-Helsinki/yjdh/commit/eb2fcf75c25b77ba976f45f4612b16cf63d52732))
* Add application changes to handler's side bar (hl-1063) ([#2865](https://github.com/City-of-Helsinki/yjdh/issues/2865)) ([9d6e95a](https://github.com/City-of-Helsinki/yjdh/commit/9d6e95ad823e4291a4f9933acfe2e58712183655))
* Add model for application alterations ([191d031](https://github.com/City-of-Helsinki/yjdh/commit/191d031688bb95f1d5f4c5310bb13d2ec295e137))
* Handle update record callback ([#2854](https://github.com/City-of-Helsinki/yjdh/issues/2854)) ([03eaae2](https://github.com/City-of-Helsinki/yjdh/commit/03eaae2264f45f2df57f729ddbbfbec76c3b8708))
* Remove "Palkan" from salary benefit locale ([#2881](https://github.com/City-of-Helsinki/yjdh/issues/2881)) ([afbc97a](https://github.com/City-of-Helsinki/yjdh/commit/afbc97ab461a846dd93e8ef784e4660b6d30095b))
* Review application edit changes before submit (hl-1062) ([#2838](https://github.com/City-of-Helsinki/yjdh/issues/2838)) ([2d9c08e](https://github.com/City-of-Helsinki/yjdh/commit/2d9c08e6dc33bd03d390408131db0445e2c7e517))


### Bug Fixes

* Attachment type in ahjo payload ([#2868](https://github.com/City-of-Helsinki/yjdh/issues/2868)) ([daeb983](https://github.com/City-of-Helsinki/yjdh/commit/daeb9839f251efec2e078f13b8f58b4a689e25a7))
* Exclude xml attachments from open case ([#2871](https://github.com/City-of-Helsinki/yjdh/issues/2871)) ([f00b4a1](https://github.com/City-of-Helsinki/yjdh/commit/f00b4a1c796dcadb142725fabfd810ada3a9dd1e))
* Records in update dict to lowercase ([#2874](https://github.com/City-of-Helsinki/yjdh/issues/2874)) ([d536285](https://github.com/City-of-Helsinki/yjdh/commit/d536285c2b8a813de83c151c90ccc07023f3fb70))
* Remove extra bracket from secret decision ([#2870](https://github.com/City-of-Helsinki/yjdh/issues/2870)) ([8fb25fd](https://github.com/City-of-Helsinki/yjdh/commit/8fb25fd6ae7787e45ce73ded97baaf91467ee73f))
* Unclosed p-tag ([#2852](https://github.com/City-of-Helsinki/yjdh/issues/2852)) ([08dab8d](https://github.com/City-of-Helsinki/yjdh/commit/08dab8d31358c212321bab9cc08e58840ab4ada3))
* Various calculator fixes and tweaks ([#2872](https://github.com/City-of-Helsinki/yjdh/issues/2872)) ([ae0f48b](https://github.com/City-of-Helsinki/yjdh/commit/ae0f48b2b1ab0eda7d3cfbaab1f42b28c4bdf3ad))

## [1.7.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.6.0...benefit-backend-v1.7.0) (2024-02-14)


### Features

* Add a command for opening cases in ahjo ([#2724](https://github.com/City-of-Helsinki/yjdh/issues/2724)) ([776fbff](https://github.com/City-of-Helsinki/yjdh/commit/776fbff9fecae00597d1ae98d0d2dc795c9bf9df))
* Application change history (HL-1061) ([#2674](https://github.com/City-of-Helsinki/yjdh/issues/2674)) ([f1e79d5](https://github.com/City-of-Helsinki/yjdh/commit/f1e79d586681452ee4f9e8db54a780001a8c80d6))
* Change open case message title ([#2799](https://github.com/City-of-Helsinki/yjdh/issues/2799)) ([8ce03b2](https://github.com/City-of-Helsinki/yjdh/commit/8ce03b23803792af359ac5e729f7a8b5be0788c6))
* Edit application form with handler GUI (HL-990) ([#2764](https://github.com/City-of-Helsinki/yjdh/issues/2764)) ([40cb66f](https://github.com/City-of-Helsinki/yjdh/commit/40cb66fba2cca156dbbb60c128eb5f88a7ca1743))
* List old processed applications on the archive page (HL-1011) ([72ed278](https://github.com/City-of-Helsinki/yjdh/commit/72ed27869efa89551092028800e6c402ab69321d))
* Query for rejected_by_talpa batches and show talpa_status icon for each app ([#2743](https://github.com/City-of-Helsinki/yjdh/issues/2743)) ([cef39d5](https://github.com/City-of-Helsinki/yjdh/commit/cef39d588e6816eb35e49e1a18962f02bc22fe75))


### Bug Fixes

* Cast open case json reference field to string ([#2788](https://github.com/City-of-Helsinki/yjdh/issues/2788)) ([d0bd02c](https://github.com/City-of-Helsinki/yjdh/commit/d0bd02ca1d1710e8a01a5676ba8ca131efcff99b))
* Limit precision to seconds ([#2803](https://github.com/City-of-Helsinki/yjdh/issues/2803)) ([0c9626f](https://github.com/City-of-Helsinki/yjdh/commit/0c9626f07db9b86a89c12fb6fe6a1c311b1e5fe4))
* Make caseId and caseGuid optional ([#2804](https://github.com/City-of-Helsinki/yjdh/issues/2804)) ([85c89d7](https://github.com/City-of-Helsinki/yjdh/commit/85c89d771ecc7fbaebab958ef7b5cafdd8fce795))
* Move MannerOfReceipt into the record dict ([#2775](https://github.com/City-of-Helsinki/yjdh/issues/2775)) ([156ee20](https://github.com/City-of-Helsinki/yjdh/commit/156ee201efcc48e408267384cb04d2df8893ef4c))

## [1.6.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.5.1...benefit-backend-v1.6.0) (2024-01-16)


### Features

* Add callback for Talpa robot ([#2654](https://github.com/City-of-Helsinki/yjdh/issues/2654)) ([58376c5](https://github.com/City-of-Helsinki/yjdh/commit/58376c5e3ff10230ad641666e240c994d1988764))
* Applicant messenger should be disabled if app is in a batch (hl-1059) ([#2619](https://github.com/City-of-Helsinki/yjdh/issues/2619)) ([fe0995f](https://github.com/City-of-Helsinki/yjdh/commit/fe0995fe1ee96414f36ab113de88b7b81054eec6))
* Application pdf summary to open case request ([#2625](https://github.com/City-of-Helsinki/yjdh/issues/2625)) ([7f44c5e](https://github.com/City-of-Helsinki/yjdh/commit/7f44c5e832ccece7405d5b5159899399600c3096))
* Show benefit amount in batch app listing ([#2706](https://github.com/City-of-Helsinki/yjdh/issues/2706)) ([63bc823](https://github.com/City-of-Helsinki/yjdh/commit/63bc82392072a14652b4f2efe80707c62052baaf))
* Update open case payload to latest version ([#2702](https://github.com/City-of-Helsinki/yjdh/issues/2702)) ([878567f](https://github.com/City-of-Helsinki/yjdh/commit/878567fea89394ceccce3efa454e965b21b49138))


### Bug Fixes

* An array of fixes for HL-1053 ([#2726](https://github.com/City-of-Helsinki/yjdh/issues/2726)) ([6800c39](https://github.com/City-of-Helsinki/yjdh/commit/6800c392848e5c0e0221abad55e6153ba4d85968))
* Modify batches to better support TALPA and handler's work (HL-1053) ([#2615](https://github.com/City-of-Helsinki/yjdh/issues/2615)) ([8c58eb0](https://github.com/City-of-Helsinki/yjdh/commit/8c58eb0a74810f7895fc8ecf4dee31fe40ebc55e))
* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

## [1.5.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.5.0...benefit-backend-v1.5.1) (2024-01-03)


### Bug Fixes

* HL-1093 year 2024 bug ([#2684](https://github.com/City-of-Helsinki/yjdh/issues/2684)) ([b5c94c4](https://github.com/City-of-Helsinki/yjdh/commit/b5c94c40449a47ac4524d2c3c5fedc1fab15fa6b))
* Use base64 encoded image ([#2661](https://github.com/City-of-Helsinki/yjdh/issues/2661)) ([07efaee](https://github.com/City-of-Helsinki/yjdh/commit/07efaee741015a1d9769d2e733f73bbd357ddcab))

## [1.5.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.4.0...benefit-backend-v1.5.0) (2023-12-21)


### Features

* Enable/disable Ahjo IP restriction, allow multiple IPs ([#2598](https://github.com/City-of-Helsinki/yjdh/issues/2598)) ([e78e1be](https://github.com/City-of-Helsinki/yjdh/commit/e78e1be62091b4d43656a044a8bbe8fb28e8819f))
* Hl 1069 cancel application in  ahjo ([a9f66d7](https://github.com/City-of-Helsinki/yjdh/commit/a9f66d76afbb316120a6198d10cfaf0b7f599bea))
* Return 404 instead of 400 when no applications for talpa robot ([#2600](https://github.com/City-of-Helsinki/yjdh/issues/2600)) ([e044f9b](https://github.com/City-of-Helsinki/yjdh/commit/e044f9b0d2b37ce9f4c3f0e377ffdcd79bc3a80e))
* Use MJML to generate HTML emails (HL-999) ([#2586](https://github.com/City-of-Helsinki/yjdh/issues/2586)) ([7939f5e](https://github.com/City-of-Helsinki/yjdh/commit/7939f5e2a023f8fc13c55ff95c5a0621005feff1))


### Bug Fixes

* Generate talpa export csv synchronously ([#2608](https://github.com/City-of-Helsinki/yjdh/issues/2608)) ([05e78d4](https://github.com/City-of-Helsinki/yjdh/commit/05e78d4227688fabf66d7e5b0606855926a1f940))
* Redo various issues with typos and text flow ([#2622](https://github.com/City-of-Helsinki/yjdh/issues/2622)) ([#2637](https://github.com/City-of-Helsinki/yjdh/issues/2637)) ([37e3e5d](https://github.com/City-of-Helsinki/yjdh/commit/37e3e5d9306ee1ee891a99ab67e9a0a78f9c6f40))
* Remove phone number length restriction (HL-1088) ([#2648](https://github.com/City-of-Helsinki/yjdh/issues/2648)) ([857fad7](https://github.com/City-of-Helsinki/yjdh/commit/857fad70bb111e4b970486c60cf6829292e183af))
* Revert various issues with typos and text flow ([#2622](https://github.com/City-of-Helsinki/yjdh/issues/2622)) ([c870fcb](https://github.com/City-of-Helsinki/yjdh/commit/c870fcb932b2eff85e3c03339a9fd859877ba274))
* Show rejected in archive (HL-1039) ([#2588](https://github.com/City-of-Helsinki/yjdh/issues/2588)) ([b1fd901](https://github.com/City-of-Helsinki/yjdh/commit/b1fd90178542a9b0c98cb4b0bcf5ddf0ec3e50e3))
* Some urls were missing from email templates ([#2614](https://github.com/City-of-Helsinki/yjdh/issues/2614)) ([cab15b0](https://github.com/City-of-Helsinki/yjdh/commit/cab15b026bd64a3f03e9bf6b9b0129b19d0a60ae))
* Various issues with typos and text flow ([#2622](https://github.com/City-of-Helsinki/yjdh/issues/2622)) ([928dd92](https://github.com/City-of-Helsinki/yjdh/commit/928dd92fe4b564e29b2cc4d41929d551c8dd1ac4))

## [1.4.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.3.0...benefit-backend-v1.4.0) (2023-12-07)


### Features

* Add AD username column to user ([#2499](https://github.com/City-of-Helsinki/yjdh/issues/2499)) ([acc1147](https://github.com/City-of-Helsinki/yjdh/commit/acc114772ffc7724030e68c94d651938f8d26951))
* Ahjo download link and  callback url ([33bf40b](https://github.com/City-of-Helsinki/yjdh/commit/33bf40bbe36555cee3797265b31e4300b27eba2e))
* Full pdf summary of applications (HL-708, HL-903) ([#2524](https://github.com/City-of-Helsinki/yjdh/issues/2524)) ([644aaf1](https://github.com/City-of-Helsinki/yjdh/commit/644aaf1d13532acbcbc2f1252335a1ff7f88405d))
* Hl 1048  add bom ([#2495](https://github.com/City-of-Helsinki/yjdh/issues/2495)) ([a6d4323](https://github.com/City-of-Helsinki/yjdh/commit/a6d43231045564e552f3d8f8f0f97f02957d7720))
* Hl 970 open ahjo case ([#2519](https://github.com/City-of-Helsinki/yjdh/issues/2519)) ([faa899c](https://github.com/City-of-Helsinki/yjdh/commit/faa899c111e0790258a1b31dba23a59920a80f2f))
* Optionally add a byte order mark to csv export ([#2455](https://github.com/City-of-Helsinki/yjdh/issues/2455)) ([1d23a7a](https://github.com/City-of-Helsinki/yjdh/commit/1d23a7aa69e11175183e760728823223f466dc7a))
* Upgrade django to 3.2.23 (i.e. latest 3.2.x) in all backends ([410ac0e](https://github.com/City-of-Helsinki/yjdh/commit/410ac0e2f042774e0fdd12a862242ce481dff46b))


### Bug Fixes

* Add missing migration file ([#2545](https://github.com/City-of-Helsinki/yjdh/issues/2545)) ([70401dc](https://github.com/City-of-Helsinki/yjdh/commit/70401dc744853f3e6283d0bf7d80fe6b759079b4))
* Allow applicant messages for all but cancelled and archived app ([#2496](https://github.com/City-of-Helsinki/yjdh/issues/2496)) ([968ec9d](https://github.com/City-of-Helsinki/yjdh/commit/968ec9d2d99f919d3979c094b627dcfd5b4683fd))
* Application pdf summary improvements ([#2537](https://github.com/City-of-Helsinki/yjdh/issues/2537)) ([8b86192](https://github.com/City-of-Helsinki/yjdh/commit/8b861927ee6a1ae333f43702be9351a29011393f))
* Application summary pdf issues found during tests ([#2547](https://github.com/City-of-Helsinki/yjdh/issues/2547)) ([a838481](https://github.com/City-of-Helsinki/yjdh/commit/a8384811ab08a033acf9bd4dfb424fd60dd7e56e))
* Messages can not be sent if application is already in a batch ([#2543](https://github.com/City-of-Helsinki/yjdh/issues/2543)) ([113c426](https://github.com/City-of-Helsinki/yjdh/commit/113c42638510ec53dbb3c92f8de54e8ddb846846))
* Migration to add description type based on row type (HL-1046) ([36b15ba](https://github.com/City-of-Helsinki/yjdh/commit/36b15baa435e856905b67b549511eafab63abc16))

## [1.3.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.2.0...benefit-backend-v1.3.0) (2023-11-14)


### Features

* Add utility for hashing Ahjo attachments ([#2420](https://github.com/City-of-Helsinki/yjdh/issues/2420)) ([ca789f8](https://github.com/City-of-Helsinki/yjdh/commit/ca789f8a1a4a0600a813cebc6c398f517bb76d05))
* Change  some Talpa csv export column titles ([#2426](https://github.com/City-of-Helsinki/yjdh/issues/2426)) ([8d466c6](https://github.com/City-of-Helsinki/yjdh/commit/8d466c632b4180d5e9e54983a0be14506b112319))
* New calculator, handling and handled views (HL-907) ([#2422](https://github.com/City-of-Helsinki/yjdh/issues/2422)) ([af71c3f](https://github.com/City-of-Helsinki/yjdh/commit/af71c3fb03cc1812c1278dcf221507aec461dc28))
* Update python-stdnum (HL-662) ([#2424](https://github.com/City-of-Helsinki/yjdh/issues/2424)) ([018a035](https://github.com/City-of-Helsinki/yjdh/commit/018a0354f52ad32fcfdcd83e2c7a3d14a9b0a7ae))


### Bug Fixes

* HL-1005, HL-916,  ([#2379](https://github.com/City-of-Helsinki/yjdh/issues/2379)) ([779bed2](https://github.com/City-of-Helsinki/yjdh/commit/779bed2787ef7cc0c11f9e49d3b85a9bd891174c))
* Some backend error messages translated ([#2453](https://github.com/City-of-Helsinki/yjdh/issues/2453)) ([04b42e2](https://github.com/City-of-Helsinki/yjdh/commit/04b42e2e12038f196fe2e8d355cfa48b6a759b44))

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.1.2...benefit-backend-v1.2.0) (2023-10-23)


### Features

* New "received" view (HL-905) ([#2351](https://github.com/City-of-Helsinki/yjdh/issues/2351)) ([ea3738d](https://github.com/City-of-Helsinki/yjdh/commit/ea3738d830ebd467daeb4f0f49915004390794bd))
* New review view ([6481ea2](https://github.com/City-of-Helsinki/yjdh/commit/6481ea2115c73452905bb0c8db076ba315058e47))
* Support for paper application date ([6774c2c](https://github.com/City-of-Helsinki/yjdh/commit/6774c2cdee1c8f99e01e9031d2c7c0ac64844164))


### Bug Fixes

* Paysubsidy attachment (HL-1009) ([e0536a8](https://github.com/City-of-Helsinki/yjdh/commit/e0536a8f8c4cef4418a78e432fe7075ace9e6b24))
* Selector in handler browser tests (HL-997) ([#2317](https://github.com/City-of-Helsinki/yjdh/issues/2317)) ([4d0321a](https://github.com/City-of-Helsinki/yjdh/commit/4d0321ae28218bc4e440bc6e14617417c93ea4fe))

## [1.1.2](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.1.1...benefit-backend-v1.1.2) (2023-09-26)


### Bug Fixes

* Only one row per application in Talpa CSV export ([#2289](https://github.com/City-of-Helsinki/yjdh/issues/2289)) ([557e823](https://github.com/City-of-Helsinki/yjdh/commit/557e82345852c21bfde49af51d49ee41a558b352))

## [1.1.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.1.0...benefit-backend-v1.1.1) (2023-08-31)


### Bug Fixes

* Allow companies without address ([#2234](https://github.com/City-of-Helsinki/yjdh/issues/2234)) ([dc78d34](https://github.com/City-of-Helsinki/yjdh/commit/dc78d34f6defcd9f960284e3279bbb0a47293be6))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.0.0...benefit-backend-v1.1.0) (2023-08-28)


### Features

* Add fields to Talpa/P2P inspectors ([f574281](https://github.com/City-of-Helsinki/yjdh/commit/f574281e37f71470bdda3ac3c7fb28311b3f2ca5))
* Add new P2P fields to Talpa CSV ([d8c2c3f](https://github.com/City-of-Helsinki/yjdh/commit/d8c2c3fb640351483e697b3c4535abbb141166a7))
* Batch P2P fields are validated based on proposal for decision ([90c87cb](https://github.com/City-of-Helsinki/yjdh/commit/90c87cb240372ce6e5746aceaa90e48e98ce4985))
* Expose is_staff attribute for user API ([30b3501](https://github.com/City-of-Helsinki/yjdh/commit/30b350116e48e383e479e56d1ece5b1150218018))
* Expose new p2p fields to batch listing ([a421590](https://github.com/City-of-Helsinki/yjdh/commit/a421590cf8ef9ee5c13b5bb7487d5031bca919cc))
* Expose previous status state to frontend ([e2a27ab](https://github.com/City-of-Helsinki/yjdh/commit/e2a27abfef76fe268267e2e4219fa5234efe3ddb))
* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* Rework batch handling so that accepted batches have an additional archival step ([d9ccd0c](https://github.com/City-of-Helsinki/yjdh/commit/d9ccd0c89337ddaf70cadb195e2742e8343011b1))
* Send language to backend on language selection ([f94eb18](https://github.com/City-of-Helsinki/yjdh/commit/f94eb1807d8ed0a271c1aba5901a0ec7292ff413))
* Test simplified_application_list's filter_archived option ([8ab6113](https://github.com/City-of-Helsinki/yjdh/commit/8ab6113336a790cdae6c927089b23ffae7d61294))
* Test too many draft batches and removal if emptied from apps ([3c6047e](https://github.com/City-of-Helsinki/yjdh/commit/3c6047e0c222202689326ec35ccbd16964c39338))


### Bug Fixes

* Allow sent_to_talpa status on batch status change ([06829f3](https://github.com/City-of-Helsinki/yjdh/commit/06829f350dfd8b719dc128c73c313f0a70d8daa7))
* Allow two decimals for working hours ([15eee56](https://github.com/City-of-Helsinki/yjdh/commit/15eee56c11d7f310cbebeb5b035641a82d10cb5e))
* Allow use of django_language cookie ([7f57cbf](https://github.com/City-of-Helsinki/yjdh/commit/7f57cbffb266053190bec35edbfa8a87c49d484a))
* Batch handler name's was missing; fix closing tag ([85b3a01](https://github.com/City-of-Helsinki/yjdh/commit/85b3a018252eef38991542fc6be004af9d50c9ec))
* Batch test failed because of new allowed status ([a59a38a](https://github.com/City-of-Helsinki/yjdh/commit/a59a38aa0bbc46a63ecb7c2dc7f74c7e710f4229))
* Batch would allow no values on p2p/ahjo fields ([99e469d](https://github.com/City-of-Helsinki/yjdh/commit/99e469d167454a1980068ad3291311247f82b7d7))
* Broken csv test because of new talpa fields ([90554bb](https://github.com/City-of-Helsinki/yjdh/commit/90554bb5f9c120dc70c8058a4bdbe769b3eaec91))
* CSV should not contain quotes ([e26ebb4](https://github.com/City-of-Helsinki/yjdh/commit/e26ebb4f610feb1f95f49e91f6542312ed28bab4))
* Get the pruned version of Talpa csv from endpoint ([b49f86b](https://github.com/City-of-Helsinki/yjdh/commit/b49f86bb7957fd5824a564b6ef4a2357238b7f1c))
* Lint backend files ([19e3470](https://github.com/City-of-Helsinki/yjdh/commit/19e347083c468d39eb8ec409491f47e67e4a05d6))
* Model tests were failing ([89754ff](https://github.com/City-of-Helsinki/yjdh/commit/89754ff08273f9fe7c685ac2b645eac06ad33f62))
* Removing app from batch would result to whole batch close animation ([be1fff8](https://github.com/City-of-Helsinki/yjdh/commit/be1fff85d6b140b681f5f13fa2d16a5b8db2066d))
* Rename conflicting migration file ([1ccd538](https://github.com/City-of-Helsinki/yjdh/commit/1ccd538e986459316d328123ed484d9147162228))
* Rename Talpa CSV headers ([14162d4](https://github.com/City-of-Helsinki/yjdh/commit/14162d46a73a62b822e3d27ef27c3a5e2a5876e0))
