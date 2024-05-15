# Changelog

## [3.5.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.4.0...benefit-handler-v3.5.0) (2024-05-15)


### Features

* Clear all calculation form fields from "clear" button ([#2943](https://github.com/City-of-Helsinki/yjdh/issues/2943)) ([a65bb5b](https://github.com/City-of-Helsinki/yjdh/commit/a65bb5b3b622c6beb7eabe29ccd62d7b39f4545f))
* **handler:** Add error validation logic and toast for de minimis aid form (HL-1202) ([#2933](https://github.com/City-of-Helsinki/yjdh/issues/2933)) ([752d9eb](https://github.com/City-of-Helsinki/yjdh/commit/752d9ebf75406b3616a6dfba791aa73f54cdf311))
* Implement received alterations page for handlers (HL-1246) ([#2947](https://github.com/City-of-Helsinki/yjdh/issues/2947)) ([850b364](https://github.com/City-of-Helsinki/yjdh/commit/850b364fdc756d773a2c57f32b716a9201080d43))
* Introduce handler lock to edits (hl-1149) ([#2945](https://github.com/City-of-Helsinki/yjdh/issues/2945)) ([f116b32](https://github.com/City-of-Helsinki/yjdh/commit/f116b32746a5f0a84f61d24efdcd83787a4d613b))
* Minor additions and fixes to decision drafting (HL-1274) ([#2942](https://github.com/City-of-Helsinki/yjdh/issues/2942)) ([f6cf6fb](https://github.com/City-of-Helsinki/yjdh/commit/f6cf6fbdfd539a0ab3f9e5bae69356c73731147e))
* Prepare handler application index for new ahjo integration (hl-1278) ([#2958](https://github.com/City-of-Helsinki/yjdh/issues/2958)) ([1ad52cf](https://github.com/City-of-Helsinki/yjdh/commit/1ad52cfb09f8145944e930fcac0e1bbdf1203256))


### Bug Fixes

* Do not show cents for benefit amount (hl-1294) ([#2971](https://github.com/City-of-Helsinki/yjdh/issues/2971)) ([2e7806b](https://github.com/City-of-Helsinki/yjdh/commit/2e7806b747d437c8c6130e83429d03b0afb72e95))
* Filter batches using auto_generated_by_ahjo value (hl-1304) ([#2979](https://github.com/City-of-Helsinki/yjdh/issues/2979)) ([f6a8c64](https://github.com/City-of-Helsinki/yjdh/commit/f6a8c64b759df6e5f2bcee9c22abc19a0c4eeefd))
* **frontend:** Don't use cross-env in scripts, didn't work in pipelines ([628d466](https://github.com/City-of-Helsinki/yjdh/commit/628d466c58fbbff7bf79e11f92a89ef9a2822439))
* **frontend:** Use cross-env in scripts to make them cross-platform ([7307e57](https://github.com/City-of-Helsinki/yjdh/commit/7307e5797d6b0a0bc24eded97d6724a5724a4547))
* P2p fields are now null by default ([c2a96ce](https://github.com/City-of-Helsinki/yjdh/commit/c2a96ce85520db714369f41f2f2ff5768e1269e0))
* Resolve issues with start date on handler's side (HL-1270) ([#2948](https://github.com/City-of-Helsinki/yjdh/issues/2948)) ([090fe5e](https://github.com/City-of-Helsinki/yjdh/commit/090fe5ef82e0a1fe5a905fdd55f5139fa416952c))
* Section of the law is now null by default ([fa48f1b](https://github.com/City-of-Helsinki/yjdh/commit/fa48f1bfd96a7d52ad6e531e6c4505bb93c1d333))
* **test:** More robust second test in case first one fails a few times ([acc8ef3](https://github.com/City-of-Helsinki/yjdh/commit/acc8ef3d4bff3dc4a4123f1ea5e5245198e00e42))
* Try fixing failing tests ([#2952](https://github.com/City-of-Helsinki/yjdh/issues/2952)) ([3353dc8](https://github.com/City-of-Helsinki/yjdh/commit/3353dc84ce83906c4fe0bb8e4300b9a56640e47d))

## [3.4.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.3.0...benefit-handler-v3.4.0) (2024-04-22)


### Features

* Add 'empty' text to unchanged app's change set ([#2924](https://github.com/City-of-Helsinki/yjdh/issues/2924)) ([ff0fbd0](https://github.com/City-of-Helsinki/yjdh/commit/ff0fbd074a032191f4bafb633d838673b9ccd8aa))
* ClamAV malware scanning for attachments ([#2894](https://github.com/City-of-Helsinki/yjdh/issues/2894)) ([56e640b](https://github.com/City-of-Helsinki/yjdh/commit/56e640bbd5a53dd2401e61b6f1d719a85b248b27))
* Implement new Ahjo process UI for handler (HL-1167) ([8f3d591](https://github.com/City-of-Helsinki/yjdh/commit/8f3d5914d4828b5f8985f88e7485a5be32a12e31))


### Bug Fixes

* **handler:** Add missing column "modifiedAt" for draft list (HL-914) ([#2928](https://github.com/City-of-Helsinki/yjdh/issues/2928)) ([d7ac20a](https://github.com/City-of-Helsinki/yjdh/commit/d7ac20a8a9002d77fa9f85f07eff43cb316bf16f))
* **handler:** Company name would overlap business id ([#2929](https://github.com/City-of-Helsinki/yjdh/issues/2929)) ([155bca7](https://github.com/City-of-Helsinki/yjdh/commit/155bca74c4999dfcf50ca39547b13ba3d46c3fd6))
* **handler:** De minimis validation as in applicant form ([#2932](https://github.com/City-of-Helsinki/yjdh/issues/2932)) ([53e3b5d](https://github.com/City-of-Helsinki/yjdh/commit/53e3b5df789302f09302af80278d86cfb2823d00))
* **handler:** Validation minimum for start date should be 4 months earlier, not today ([#2910](https://github.com/City-of-Helsinki/yjdh/issues/2910)) ([fe3bafb](https://github.com/City-of-Helsinki/yjdh/commit/fe3bafba37248b1adc3a9248c021f90052ddedc6))

## [3.3.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.2.0...benefit-handler-v3.3.0) (2024-03-15)


### Features

* Add application changes to handler's side bar (hl-1063) ([#2865](https://github.com/City-of-Helsinki/yjdh/issues/2865)) ([9d6e95a](https://github.com/City-of-Helsinki/yjdh/commit/9d6e95ad823e4291a4f9933acfe2e58712183655))
* Review application edit changes before submit (hl-1062) ([#2838](https://github.com/City-of-Helsinki/yjdh/issues/2838)) ([2d9c08e](https://github.com/City-of-Helsinki/yjdh/commit/2d9c08e6dc33bd03d390408131db0445e2c7e517))


### Bug Fixes

* Calculation and pay subsidies would not reset if changed on edit (hl-1110, hl-1127, hl-1130)  ([#2847](https://github.com/City-of-Helsinki/yjdh/issues/2847)) ([7f88cc5](https://github.com/City-of-Helsinki/yjdh/commit/7f88cc51e76733cee5855a20a997ed19bb69e41d))
* Import date-fns properly ([#2878](https://github.com/City-of-Helsinki/yjdh/issues/2878)) ([0f5f858](https://github.com/City-of-Helsinki/yjdh/commit/0f5f858adca19fc19579bb1db13c3bf1449485ca))
* Lint file ([480ec3f](https://github.com/City-of-Helsinki/yjdh/commit/480ec3f0f0e0a065773eff16b3d958ab817dfc2f))
* Localization keys added to change messages ([#2880](https://github.com/City-of-Helsinki/yjdh/issues/2880)) ([fe485ab](https://github.com/City-of-Helsinki/yjdh/commit/fe485ab097a55c668792c97a94caa435fc252403))
* Remove consent checkboxes from handler edit ([3ac9dcd](https://github.com/City-of-Helsinki/yjdh/commit/3ac9dcdbb689d4bb268f3ae4d36658996e3dcafa))
* Remove text about adding file, not yet supported ([#2873](https://github.com/City-of-Helsinki/yjdh/issues/2873)) ([f866d04](https://github.com/City-of-Helsinki/yjdh/commit/f866d04376b43a36c8007434045298a5a9c4ec0c))
* Remove training compensations data on changes ([#2866](https://github.com/City-of-Helsinki/yjdh/issues/2866)) ([d2bf279](https://github.com/City-of-Helsinki/yjdh/commit/d2bf27993641ca9a4e765854d056ac3fe0ae05cc))
* Remove unnecessary forward slash from url ([b9dce62](https://github.com/City-of-Helsinki/yjdh/commit/b9dce62cd9356e3a0ee738b67c3897e7cff1d3fb))
* Require confirm on attachment removal and on edit cancel (HL-1199 [#2875](https://github.com/City-of-Helsinki/yjdh/issues/2875)) ([b8de140](https://github.com/City-of-Helsinki/yjdh/commit/b8de140f787cc00ba3b0c2186e79f4dcc180c657))
* Reset form calculation if there's change in apprenticeship ([99b09bf](https://github.com/City-of-Helsinki/yjdh/commit/99b09bffcb6d91cfd1a8b3e5021636bdee557498))
* Various calculator fixes and tweaks ([#2872](https://github.com/City-of-Helsinki/yjdh/issues/2872)) ([ae0f48b](https://github.com/City-of-Helsinki/yjdh/commit/ae0f48b2b1ab0eda7d3cfbaab1f42b28c4bdf3ad))
* Wrong translation key is used ([23f4208](https://github.com/City-of-Helsinki/yjdh/commit/23f420851baecfacaf6e8b18c1f9d8dc02decb2c))

## [3.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.1.0...benefit-handler-v3.2.0) (2024-02-14)


### Features

* Edit application form with handler GUI (HL-990) ([#2764](https://github.com/City-of-Helsinki/yjdh/issues/2764)) ([40cb66f](https://github.com/City-of-Helsinki/yjdh/commit/40cb66fba2cca156dbbb60c128eb5f88a7ca1743))
* Query for rejected_by_talpa batches and show talpa_status icon for each app ([#2743](https://github.com/City-of-Helsinki/yjdh/issues/2743)) ([cef39d5](https://github.com/City-of-Helsinki/yjdh/commit/cef39d588e6816eb35e49e1a18962f02bc22fe75))


### Bug Fixes

* Handler review section bugs (HL-1119) ([#2769](https://github.com/City-of-Helsinki/yjdh/issues/2769)) ([f481829](https://github.com/City-of-Helsinki/yjdh/commit/f481829dc86ac72ae041696f5c5d5b63d1724023))

## [3.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.0.0...benefit-handler-v3.1.0) (2024-01-17)


### Features

* Show benefit amount in batch app listing ([#2706](https://github.com/City-of-Helsinki/yjdh/issues/2706)) ([63bc823](https://github.com/City-of-Helsinki/yjdh/commit/63bc82392072a14652b4f2efe80707c62052baaf))


### Bug Fixes

* An array of fixes for HL-1053 ([#2726](https://github.com/City-of-Helsinki/yjdh/issues/2726)) ([6800c39](https://github.com/City-of-Helsinki/yjdh/commit/6800c392848e5c0e0221abad55e6153ba4d85968))
* App crash on empty calculations (HL-1041) ([#2688](https://github.com/City-of-Helsinki/yjdh/issues/2688)) ([728af1f](https://github.com/City-of-Helsinki/yjdh/commit/728af1f79200b1b524569ca80716b6be6de316d7))
* Modify batches to better support TALPA and handler's work (HL-1053) ([#2615](https://github.com/City-of-Helsinki/yjdh/issues/2615)) ([8c58eb0](https://github.com/City-of-Helsinki/yjdh/commit/8c58eb0a74810f7895fc8ecf4dee31fe40ebc55e))
* Remove isFetching as it caused render flicker ([6a00d9a](https://github.com/City-of-Helsinki/yjdh/commit/6a00d9a02a26eb468b92ed1490538bdf950deb92))
* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

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
