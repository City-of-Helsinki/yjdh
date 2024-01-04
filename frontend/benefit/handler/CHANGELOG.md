# Changelog

## [3.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v2.2.1...benefit-handler-v3.0.0) (2023-12-21)


### ⚠ BREAKING CHANGES

* renew application forms to conform to new terms

### Features

* Display appropriate error message when adding apps to batch but it's already locked ([dad590c](https://github.com/City-of-Helsinki/yjdh/commit/dad590c89c2ba78048e741f240c1c81a4c5517b4))
* Full pdf summary of applications (HL-708, HL-903) ([#2524](https://github.com/City-of-Helsinki/yjdh/issues/2524)) ([644aaf1](https://github.com/City-of-Helsinki/yjdh/commit/644aaf1d13532acbcbc2f1252335a1ff7f88405d))
* Hide handler and applicant from search engines ([510a1cd](https://github.com/City-of-Helsinki/yjdh/commit/510a1cdd7678ed3be4ca14ead2ae182eabf2bf24))
* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* New "received" view (HL-905) ([#2351](https://github.com/City-of-Helsinki/yjdh/issues/2351)) ([ea3738d](https://github.com/City-of-Helsinki/yjdh/commit/ea3738d830ebd467daeb4f0f49915004390794bd))
* New archived view (HL-908) ([#2427](https://github.com/City-of-Helsinki/yjdh/issues/2427)) ([beab384](https://github.com/City-of-Helsinki/yjdh/commit/beab384c85aa57a5c110b395a3a569de700e08a9))
* New calculator, handling and handled views (HL-907) ([#2422](https://github.com/City-of-Helsinki/yjdh/issues/2422)) ([af71c3f](https://github.com/City-of-Helsinki/yjdh/commit/af71c3fb03cc1812c1278dcf221507aec461dc28))
* New handling view (HL-906) ([#2385](https://github.com/City-of-Helsinki/yjdh/issues/2385)) ([055797a](https://github.com/City-of-Helsinki/yjdh/commit/055797a293c78a302fca689a57629040c9840887))
* New review view ([6481ea2](https://github.com/City-of-Helsinki/yjdh/commit/6481ea2115c73452905bb0c8db076ba315058e47))
* New style for back dialog ([c054187](https://github.com/City-of-Helsinki/yjdh/commit/c05418764e3b350f876537a6bcf72f36e8bde151))
* P2p/ahjo inspection inputs are shown based on radio selection ([d85001b](https://github.com/City-of-Helsinki/yjdh/commit/d85001bced1aac0232356c8b7e21c2dbea39da61))
* Refactor and add confirmation to all batch status changes ([d4a70bd](https://github.com/City-of-Helsinki/yjdh/commit/d4a70bd7b96449d65ecd7aa65e976e00c0de866f))
* Refetch batches after every 60 seconds ([200d2fe](https://github.com/City-of-Helsinki/yjdh/commit/200d2fec79315872e3b82a30a18524884f60794d))
* Renew application forms to conform to new terms ([de31e8a](https://github.com/City-of-Helsinki/yjdh/commit/de31e8a5b3d4ff0b4d24466e37f30b8067617831))
* Renew application overview step (HL-945) ([#2334](https://github.com/City-of-Helsinki/yjdh/issues/2334)) ([196af97](https://github.com/City-of-Helsinki/yjdh/commit/196af9722c47a18e20bee696f02d1ac06f847da3))
* Report of a possible error when locking or opening an app ([44cc717](https://github.com/City-of-Helsinki/yjdh/commit/44cc717e05db3d3e5fcf6e7e801154f90c3db52d))
* Rework batch handling so that accepted batches have an additional archival step ([d9ccd0c](https://github.com/City-of-Helsinki/yjdh/commit/d9ccd0c89337ddaf70cadb195e2742e8343011b1))
* Some small visual changes to archive page ([9cb38b1](https://github.com/City-of-Helsinki/yjdh/commit/9cb38b17ff37e25ddac7c5f64c18a64c78e4375b))
* Support for paper application date ([6774c2c](https://github.com/City-of-Helsinki/yjdh/commit/6774c2cdee1c8f99e01e9031d2c7c0ac64844164))
* Transition batch with close animation when status changes ([59aa19f](https://github.com/City-of-Helsinki/yjdh/commit/59aa19f5a1710e002ceb3eafce33aefe1d2a92a1))
* Trash batch, use tooltip and toggle button to remove batch from being locked ([89d320d](https://github.com/City-of-Helsinki/yjdh/commit/89d320d17325256d85971b149fb115c6c420e59c))
* Update finnish-ssn to 2.1.1 (HL-662) ([#2439](https://github.com/City-of-Helsinki/yjdh/issues/2439)) ([caad473](https://github.com/City-of-Helsinki/yjdh/commit/caad47333be57fd04c5fe57272f1b0832fad46e5))
* Use openDrawer param on application page to open sidebar ([ff747ae](https://github.com/City-of-Helsinki/yjdh/commit/ff747ae1cd6ace72ccd769907c2b3c78e8af88d7))
* Use P2P fields in batch form ([307120e](https://github.com/City-of-Helsinki/yjdh/commit/307120e9e18b61c0b047d889adbbf237f3e55c95))
* Use sms style layout for chats in applicant and handler ([c0ba913](https://github.com/City-of-Helsinki/yjdh/commit/c0ba913db40cea2d59235b819a8ce07a418ea5b9))
* Users without permissions will be logged out ([4a84f92](https://github.com/City-of-Helsinki/yjdh/commit/4a84f92ed1c20870094ebd288a1f6f59d0db1caa))


### Bug Fixes

* Add missing messenger translations ([59d253f](https://github.com/City-of-Helsinki/yjdh/commit/59d253fc0406b3d11d8f9a826ff6e20939b96502))
* Add more mime types as allowed uploads ([87a9c66](https://github.com/City-of-Helsinki/yjdh/commit/87a9c669fd2753680ccfe20a97e097a82c4eb59e))
* Allow two decimals for working hours ([15eee56](https://github.com/City-of-Helsinki/yjdh/commit/15eee56c11d7f310cbebeb5b035641a82d10cb5e))
* Ask apprentishipProgram also for GRANTED_AGED ([#2306](https://github.com/City-of-Helsinki/yjdh/issues/2306)) ([47da9f1](https://github.com/City-of-Helsinki/yjdh/commit/47da9f1a61576879b25ca260baedfb4bf559975c))
* Batch animation bug which also broke error toast ([#2283](https://github.com/City-of-Helsinki/yjdh/issues/2283)) ([0f248c2](https://github.com/City-of-Helsinki/yjdh/commit/0f248c26b2a178bfb485ed505448634827d80f32))
* Batch handler name's was missing; fix closing tag ([85b3a01](https://github.com/City-of-Helsinki/yjdh/commit/85b3a018252eef38991542fc6be004af9d50c9ec))
* Broken tests and audit ([#2374](https://github.com/City-of-Helsinki/yjdh/issues/2374)) ([62bbebc](https://github.com/City-of-Helsinki/yjdh/commit/62bbebc930dd95cc69dd5834d07a38871d238a6b))
* Calculation changed notification (HL-1057) ([#2552](https://github.com/City-of-Helsinki/yjdh/issues/2552)) ([ea65e7c](https://github.com/City-of-Helsinki/yjdh/commit/ea65e7c3b3cf2c68c30e026900f8bf1bab065a18))
* Change odd text when adding apps to batch ([e172139](https://github.com/City-of-Helsinki/yjdh/commit/e172139664152fa5737631ffe37a7508486a69b9))
* Conditional pay subsidy percentage for not_granted ([536dbe4](https://github.com/City-of-Helsinki/yjdh/commit/536dbe42235f96b359691fdb6fc2982c5644b84a))
* Confusing text when application is accepted or rejected ([6dd2599](https://github.com/City-of-Helsinki/yjdh/commit/6dd259941176ee47d8bc2ddb779c2f823218f778))
* Decided and rejected batch should be archived ([ccc0cfc](https://github.com/City-of-Helsinki/yjdh/commit/ccc0cfc4167304a54009ec32ede3a0814490bb3d))
* Disappearing de minimis aid rows and grantedAt datepicker ([7cb55e2](https://github.com/City-of-Helsinki/yjdh/commit/7cb55e2e6f83af3b3e5f7abaea32a4a1ba11df5b))
* Don't show 'per month' after total (HL-1046) ([40bb4ef](https://github.com/City-of-Helsinki/yjdh/commit/40bb4efcd85af2c448d11cb0f8e252f2c8831b1e))
* Handler application validations (HL-991) ([#2587](https://github.com/City-of-Helsinki/yjdh/issues/2587)) ([4369883](https://github.com/City-of-Helsinki/yjdh/commit/43698830dbcd11134398975221a8c61719a1058b))
* Hide certain actions when app is archived or in a batch ([5cfb28c](https://github.com/City-of-Helsinki/yjdh/commit/5cfb28c01cc32d690dd42d6b9eaccd919be9a9ff))
* HL-1005, HL-916,  ([#2379](https://github.com/City-of-Helsinki/yjdh/issues/2379)) ([779bed2](https://github.com/City-of-Helsinki/yjdh/commit/779bed2787ef7cc0c11f9e49d3b85a9bd891174c))
* Lint issues ([2131591](https://github.com/City-of-Helsinki/yjdh/commit/2131591324d492aef735a542a690284d21e34e78))
* No need for paysubsidy attachment when no subsidies (HL-1011) ([#2336](https://github.com/City-of-Helsinki/yjdh/issues/2336)) ([d28703c](https://github.com/City-of-Helsinki/yjdh/commit/d28703c9c5c75e37272d02e5ebf91f652c8c2c56))
* Non-date string crash in trainingCompensationEndDate ([#2262](https://github.com/City-of-Helsinki/yjdh/issues/2262)) ([592c533](https://github.com/City-of-Helsinki/yjdh/commit/592c533d1f2b8b762d70f0f84ddedb9f9f8cf80a))
* Paysubsidy attachment (HL-1009) ([e0536a8](https://github.com/City-of-Helsinki/yjdh/commit/e0536a8f8c4cef4418a78e432fe7075ace9e6b24))
* Per month amounts in handled view (HL-1046) ([#2518](https://github.com/City-of-Helsinki/yjdh/issues/2518)) ([7a7f4ef](https://github.com/City-of-Helsinki/yjdh/commit/7a7f4efdab3447e2cfca7553183db0102bace61d))
* Removing app from batch would result to whole batch close animation ([be1fff8](https://github.com/City-of-Helsinki/yjdh/commit/be1fff85d6b140b681f5f13fa2d16a5b8db2066d))
* Salarybenefit datepicker lang ([#2264](https://github.com/City-of-Helsinki/yjdh/issues/2264)) ([43caf3e](https://github.com/City-of-Helsinki/yjdh/commit/43caf3e13bc6b34df668f399d2f3c767d36040ae))
* Selector in handler browser tests (HL-997) ([#2317](https://github.com/City-of-Helsinki/yjdh/issues/2317)) ([4d0321a](https://github.com/City-of-Helsinki/yjdh/commit/4d0321ae28218bc4e440bc6e14617417c93ea4fe))
* Send default paySubsidyPercent value (HL-995) ([#2311](https://github.com/City-of-Helsinki/yjdh/issues/2311)) ([c6c1abc](https://github.com/City-of-Helsinki/yjdh/commit/c6c1abcdbb8fe1332da19decf53d84a56b615a30))
* Set CSRF header instantly when getting token ([#2261](https://github.com/City-of-Helsinki/yjdh/issues/2261)) ([9d8009d](https://github.com/City-of-Helsinki/yjdh/commit/9d8009df4bf549ec2c93d5cbb9b4e7cff54fcb3a))
* Some favicons had wrong asset path ([4eae5a3](https://github.com/City-of-Helsinki/yjdh/commit/4eae5a3dd0fa507d6e7c25404c15b2d9014f6882))
* Tables would sort dates based on alphabetical order ([f87056c](https://github.com/City-of-Helsinki/yjdh/commit/f87056c5336439e0434d1b02474f4e1e48d59904))
* Tests for new handler application (HL-812) ([#2307](https://github.com/City-of-Helsinki/yjdh/issues/2307)) ([921a08b](https://github.com/City-of-Helsinki/yjdh/commit/921a08b6ec666a9a681f582db24c1eb4c75f84b0))
* Wrong calculator amounts in handling views (HL-1038) ([#2463](https://github.com/City-of-Helsinki/yjdh/issues/2463)) ([92ac83e](https://github.com/City-of-Helsinki/yjdh/commit/92ac83eef6add14c7d98a55612f444fc054e2e3f))

## [2.2.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v2.2.0...benefit-handler-v2.2.1) (2023-12-21)


### Bug Fixes

* Handler application validations (HL-991) ([#2587](https://github.com/City-of-Helsinki/yjdh/issues/2587)) ([4369883](https://github.com/City-of-Helsinki/yjdh/commit/43698830dbcd11134398975221a8c61719a1058b))

## [2.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v2.1.0...benefit-handler-v2.2.0) (2023-12-07)


### Features

* Full pdf summary of applications (HL-708, HL-903) ([#2524](https://github.com/City-of-Helsinki/yjdh/issues/2524)) ([644aaf1](https://github.com/City-of-Helsinki/yjdh/commit/644aaf1d13532acbcbc2f1252335a1ff7f88405d))


### Bug Fixes

* Calculation changed notification (HL-1057) ([#2552](https://github.com/City-of-Helsinki/yjdh/issues/2552)) ([ea65e7c](https://github.com/City-of-Helsinki/yjdh/commit/ea65e7c3b3cf2c68c30e026900f8bf1bab065a18))
* Don't show 'per month' after total (HL-1046) ([40bb4ef](https://github.com/City-of-Helsinki/yjdh/commit/40bb4efcd85af2c448d11cb0f8e252f2c8831b1e))
* Per month amounts in handled view (HL-1046) ([#2518](https://github.com/City-of-Helsinki/yjdh/issues/2518)) ([7a7f4ef](https://github.com/City-of-Helsinki/yjdh/commit/7a7f4efdab3447e2cfca7553183db0102bace61d))
* Wrong calculator amounts in handling views (HL-1038) ([#2463](https://github.com/City-of-Helsinki/yjdh/issues/2463)) ([92ac83e](https://github.com/City-of-Helsinki/yjdh/commit/92ac83eef6add14c7d98a55612f444fc054e2e3f))

## [2.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v2.0.0...benefit-handler-v2.1.0) (2023-11-15)


### Features

* New archived view (HL-908) ([#2427](https://github.com/City-of-Helsinki/yjdh/issues/2427)) ([beab384](https://github.com/City-of-Helsinki/yjdh/commit/beab384c85aa57a5c110b395a3a569de700e08a9))
* New calculator, handling and handled views (HL-907) ([#2422](https://github.com/City-of-Helsinki/yjdh/issues/2422)) ([af71c3f](https://github.com/City-of-Helsinki/yjdh/commit/af71c3fb03cc1812c1278dcf221507aec461dc28))
* New handling view (HL-906) ([#2385](https://github.com/City-of-Helsinki/yjdh/issues/2385)) ([055797a](https://github.com/City-of-Helsinki/yjdh/commit/055797a293c78a302fca689a57629040c9840887))
* Update finnish-ssn to 2.1.1 (HL-662) ([#2439](https://github.com/City-of-Helsinki/yjdh/issues/2439)) ([caad473](https://github.com/City-of-Helsinki/yjdh/commit/caad47333be57fd04c5fe57272f1b0832fad46e5))


### Bug Fixes

* HL-1005, HL-916,  ([#2379](https://github.com/City-of-Helsinki/yjdh/issues/2379)) ([779bed2](https://github.com/City-of-Helsinki/yjdh/commit/779bed2787ef7cc0c11f9e49d3b85a9bd891174c))

## [2.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v1.1.0...benefit-handler-v2.0.0) (2023-10-23)


### ⚠ BREAKING CHANGES

* renew application forms to conform to new terms

### Features

* New "received" view (HL-905) ([#2351](https://github.com/City-of-Helsinki/yjdh/issues/2351)) ([ea3738d](https://github.com/City-of-Helsinki/yjdh/commit/ea3738d830ebd467daeb4f0f49915004390794bd))
* New review view ([6481ea2](https://github.com/City-of-Helsinki/yjdh/commit/6481ea2115c73452905bb0c8db076ba315058e47))
* New style for back dialog ([c054187](https://github.com/City-of-Helsinki/yjdh/commit/c05418764e3b350f876537a6bcf72f36e8bde151))
* Renew application forms to conform to new terms ([de31e8a](https://github.com/City-of-Helsinki/yjdh/commit/de31e8a5b3d4ff0b4d24466e37f30b8067617831))
* Renew application overview step (HL-945) ([#2334](https://github.com/City-of-Helsinki/yjdh/issues/2334)) ([196af97](https://github.com/City-of-Helsinki/yjdh/commit/196af9722c47a18e20bee696f02d1ac06f847da3))
* Support for paper application date ([6774c2c](https://github.com/City-of-Helsinki/yjdh/commit/6774c2cdee1c8f99e01e9031d2c7c0ac64844164))


### Bug Fixes

* Ask apprentishipProgram also for GRANTED_AGED ([#2306](https://github.com/City-of-Helsinki/yjdh/issues/2306)) ([47da9f1](https://github.com/City-of-Helsinki/yjdh/commit/47da9f1a61576879b25ca260baedfb4bf559975c))
* Batch animation bug which also broke error toast ([#2283](https://github.com/City-of-Helsinki/yjdh/issues/2283)) ([0f248c2](https://github.com/City-of-Helsinki/yjdh/commit/0f248c26b2a178bfb485ed505448634827d80f32))
* Broken tests and audit ([#2374](https://github.com/City-of-Helsinki/yjdh/issues/2374)) ([62bbebc](https://github.com/City-of-Helsinki/yjdh/commit/62bbebc930dd95cc69dd5834d07a38871d238a6b))
* Conditional pay subsidy percentage for not_granted ([536dbe4](https://github.com/City-of-Helsinki/yjdh/commit/536dbe42235f96b359691fdb6fc2982c5644b84a))
* Disappearing de minimis aid rows and grantedAt datepicker ([7cb55e2](https://github.com/City-of-Helsinki/yjdh/commit/7cb55e2e6f83af3b3e5f7abaea32a4a1ba11df5b))
* No need for paysubsidy attachment when no subsidies (HL-1011) ([#2336](https://github.com/City-of-Helsinki/yjdh/issues/2336)) ([d28703c](https://github.com/City-of-Helsinki/yjdh/commit/d28703c9c5c75e37272d02e5ebf91f652c8c2c56))
* Non-date string crash in trainingCompensationEndDate ([#2262](https://github.com/City-of-Helsinki/yjdh/issues/2262)) ([592c533](https://github.com/City-of-Helsinki/yjdh/commit/592c533d1f2b8b762d70f0f84ddedb9f9f8cf80a))
* Paysubsidy attachment (HL-1009) ([e0536a8](https://github.com/City-of-Helsinki/yjdh/commit/e0536a8f8c4cef4418a78e432fe7075ace9e6b24))
* Salarybenefit datepicker lang ([#2264](https://github.com/City-of-Helsinki/yjdh/issues/2264)) ([43caf3e](https://github.com/City-of-Helsinki/yjdh/commit/43caf3e13bc6b34df668f399d2f3c767d36040ae))
* Selector in handler browser tests (HL-997) ([#2317](https://github.com/City-of-Helsinki/yjdh/issues/2317)) ([4d0321a](https://github.com/City-of-Helsinki/yjdh/commit/4d0321ae28218bc4e440bc6e14617417c93ea4fe))
* Send default paySubsidyPercent value (HL-995) ([#2311](https://github.com/City-of-Helsinki/yjdh/issues/2311)) ([c6c1abc](https://github.com/City-of-Helsinki/yjdh/commit/c6c1abcdbb8fe1332da19decf53d84a56b615a30))
* Set CSRF header instantly when getting token ([#2261](https://github.com/City-of-Helsinki/yjdh/issues/2261)) ([9d8009d](https://github.com/City-of-Helsinki/yjdh/commit/9d8009df4bf549ec2c93d5cbb9b4e7cff54fcb3a))
* Tests for new handler application (HL-812) ([#2307](https://github.com/City-of-Helsinki/yjdh/issues/2307)) ([921a08b](https://github.com/City-of-Helsinki/yjdh/commit/921a08b6ec666a9a681f582db24c1eb4c75f84b0))

## [1.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v1.0.0...benefit-handler-v1.1.0) (2023-08-28)


### Features

* Display appropriate error message when adding apps to batch but it's already locked ([dad590c](https://github.com/City-of-Helsinki/yjdh/commit/dad590c89c2ba78048e741f240c1c81a4c5517b4))
* Hide handler and applicant from search engines ([510a1cd](https://github.com/City-of-Helsinki/yjdh/commit/510a1cdd7678ed3be4ca14ead2ae182eabf2bf24))
* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* P2p/ahjo inspection inputs are shown based on radio selection ([d85001b](https://github.com/City-of-Helsinki/yjdh/commit/d85001bced1aac0232356c8b7e21c2dbea39da61))
* Refactor and add confirmation to all batch status changes ([d4a70bd](https://github.com/City-of-Helsinki/yjdh/commit/d4a70bd7b96449d65ecd7aa65e976e00c0de866f))
* Refetch batches after every 60 seconds ([200d2fe](https://github.com/City-of-Helsinki/yjdh/commit/200d2fec79315872e3b82a30a18524884f60794d))
* Rework batch handling so that accepted batches have an additional archival step ([d9ccd0c](https://github.com/City-of-Helsinki/yjdh/commit/d9ccd0c89337ddaf70cadb195e2742e8343011b1))
* Some small visual changes to archive page ([9cb38b1](https://github.com/City-of-Helsinki/yjdh/commit/9cb38b17ff37e25ddac7c5f64c18a64c78e4375b))
* Transition batch with close animation when status changes ([59aa19f](https://github.com/City-of-Helsinki/yjdh/commit/59aa19f5a1710e002ceb3eafce33aefe1d2a92a1))
* Trash batch, use tooltip and toggle button to remove batch from being locked ([89d320d](https://github.com/City-of-Helsinki/yjdh/commit/89d320d17325256d85971b149fb115c6c420e59c))
* Use openDrawer param on application page to open sidebar ([ff747ae](https://github.com/City-of-Helsinki/yjdh/commit/ff747ae1cd6ace72ccd769907c2b3c78e8af88d7))
* Use P2P fields in batch form ([307120e](https://github.com/City-of-Helsinki/yjdh/commit/307120e9e18b61c0b047d889adbbf237f3e55c95))
* Use sms style layout for chats in applicant and handler ([c0ba913](https://github.com/City-of-Helsinki/yjdh/commit/c0ba913db40cea2d59235b819a8ce07a418ea5b9))
* Users without permissions will be logged out ([4a84f92](https://github.com/City-of-Helsinki/yjdh/commit/4a84f92ed1c20870094ebd288a1f6f59d0db1caa))


### Bug Fixes

* Add missing messenger translations ([59d253f](https://github.com/City-of-Helsinki/yjdh/commit/59d253fc0406b3d11d8f9a826ff6e20939b96502))
* Add more mime types as allowed uploads ([87a9c66](https://github.com/City-of-Helsinki/yjdh/commit/87a9c669fd2753680ccfe20a97e097a82c4eb59e))
* Allow two decimals for working hours ([15eee56](https://github.com/City-of-Helsinki/yjdh/commit/15eee56c11d7f310cbebeb5b035641a82d10cb5e))
* Batch handler name's was missing; fix closing tag ([85b3a01](https://github.com/City-of-Helsinki/yjdh/commit/85b3a018252eef38991542fc6be004af9d50c9ec))
* Change odd text when adding apps to batch ([e172139](https://github.com/City-of-Helsinki/yjdh/commit/e172139664152fa5737631ffe37a7508486a69b9))
* Confusing text when application is accepted or rejected ([6dd2599](https://github.com/City-of-Helsinki/yjdh/commit/6dd259941176ee47d8bc2ddb779c2f823218f778))
* Decided and rejected batch should be archived ([ccc0cfc](https://github.com/City-of-Helsinki/yjdh/commit/ccc0cfc4167304a54009ec32ede3a0814490bb3d))
* Hide certain actions when app is archived or in a batch ([5cfb28c](https://github.com/City-of-Helsinki/yjdh/commit/5cfb28c01cc32d690dd42d6b9eaccd919be9a9ff))
* Lint issues ([2131591](https://github.com/City-of-Helsinki/yjdh/commit/2131591324d492aef735a542a690284d21e34e78))
* Removing app from batch would result to whole batch close animation ([be1fff8](https://github.com/City-of-Helsinki/yjdh/commit/be1fff85d6b140b681f5f13fa2d16a5b8db2066d))
* Some favicons had wrong asset path ([4eae5a3](https://github.com/City-of-Helsinki/yjdh/commit/4eae5a3dd0fa507d6e7c25404c15b2d9014f6882))
* Tables would sort dates based on alphabetical order ([f87056c](https://github.com/City-of-Helsinki/yjdh/commit/f87056c5336439e0434d1b02474f4e1e48d59904))
