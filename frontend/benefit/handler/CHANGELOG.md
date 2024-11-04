# Changelog

## [4.5.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v4.4.0...benefit-handler-v4.5.0) (2024-11-04)


### Features

* Fix issues with applicant changes (hl-1222) ([#3440](https://github.com/City-of-Helsinki/yjdh/issues/3440)) ([3610df9](https://github.com/City-of-Helsinki/yjdh/commit/3610df9c52a0a2eb9579e35fb9a632afb98409ce))
* UseRouterNavigation hook to centralize and perform "back" actions througout the app ([#3394](https://github.com/City-of-Helsinki/yjdh/issues/3394)) ([b933b1f](https://github.com/City-of-Helsinki/yjdh/commit/b933b1fe7dc8f774e810b09a1dba78a86955f3eb))


### Bug Fixes

* Chrome v130 crashes on startup ([#3450](https://github.com/City-of-Helsinki/yjdh/issues/3450)) ([cad4466](https://github.com/City-of-Helsinki/yjdh/commit/cad44663f83bf1a90f4158c68c4f8b4a069ccfe8))
* Repair some app crashing bugs when drafting the decision proposal (hl-1522) ([#3478](https://github.com/City-of-Helsinki/yjdh/issues/3478)) ([4cb17ac](https://github.com/City-of-Helsinki/yjdh/commit/4cb17ac7fadedbdd308e41eae44cfe390f400a98))
* Text improvements & added localizations (Hl-1425 & HL-1486) ([#3451](https://github.com/City-of-Helsinki/yjdh/issues/3451)) ([6105923](https://github.com/City-of-Helsinki/yjdh/commit/6105923d44818a3ddf32c787f206ba45d1a7f429))

## [4.4.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v4.3.0...benefit-handler-v4.4.0) (2024-10-16)


### Features

* Add ahjo errors to handler's application lists (hl-1421) ([#3289](https://github.com/City-of-Helsinki/yjdh/issues/3289)) ([ddb4fe4](https://github.com/City-of-Helsinki/yjdh/commit/ddb4fe44b7453c5d2a8ed1974107096e2bc86d9f))
* Add application number to 'Ahjo submission complete' splash screen ([#3409](https://github.com/City-of-Helsinki/yjdh/issues/3409)) ([415e2fe](https://github.com/City-of-Helsinki/yjdh/commit/415e2fe385ef50a9ea2ed2dc421aae870ee21692))
* Add talpa status and decision date to apps which are "in payment" state ([#3444](https://github.com/City-of-Helsinki/yjdh/issues/3444)) ([3fd9088](https://github.com/City-of-Helsinki/yjdh/commit/3fd908882ef32a403f64a89f7d5c3e433d34ca3c))
* Clone entire application (hl-1464) ([#3369](https://github.com/City-of-Helsinki/yjdh/issues/3369)) ([26051e4](https://github.com/City-of-Helsinki/yjdh/commit/26051e4935f3ba0c752ec805972a3f930f163ac0))
* Disable CSV download on invalid alteration calculation ([#3406](https://github.com/City-of-Helsinki/yjdh/issues/3406)) ([26453a8](https://github.com/City-of-Helsinki/yjdh/commit/26453a8de8229967d2299e19c841f1f970583742))
* Disable handle button until CSV has been downloaded (hl-1433) ([#3407](https://github.com/City-of-Helsinki/yjdh/issues/3407)) ([20f005e](https://github.com/City-of-Helsinki/yjdh/commit/20f005e097e843ced910552100ef17631d13cb70))
* Find related applications for a single employee (hl-1354) ([#3321](https://github.com/City-of-Helsinki/yjdh/issues/3321)) ([c0dc2e7](https://github.com/City-of-Helsinki/yjdh/commit/c0dc2e7ef1dbff6968481a2e26f9e28b2c38761f))
* Hl 1134 ([#3239](https://github.com/City-of-Helsinki/yjdh/issues/3239)) decionMaker from ahjo API ([ac1a6df](https://github.com/City-of-Helsinki/yjdh/commit/ac1a6df0a58aedd046daa1a3ed0457cab98dc9c3))
* Include attachment additions to change set (hl-1209) ([#3423](https://github.com/City-of-Helsinki/yjdh/issues/3423)) ([e33c704](https://github.com/City-of-Helsinki/yjdh/commit/e33c7045c50f73edfb791ef76f563f4121767367))
* Offset application content when sidebar is open ([#3234](https://github.com/City-of-Helsinki/yjdh/issues/3234)) ([0d7e32a](https://github.com/City-of-Helsinki/yjdh/commit/0d7e32a7a6421a23cd139a02433912a9c603ba21))
* Remove decimals from alteration sum ([#3436](https://github.com/City-of-Helsinki/yjdh/issues/3436)) ([2979d18](https://github.com/City-of-Helsinki/yjdh/commit/2979d18dc82338ff2f9eee641823783105cfb73a))
* Use applicant's startDate as initial value for calculation ([#3422](https://github.com/City-of-Helsinki/yjdh/issues/3422)) ([6b815cf](https://github.com/City-of-Helsinki/yjdh/commit/6b815cf1d0b62e112e2836989deed4f1f690fa7b))


### Bug Fixes

* Add current tab number clicks to uri when each tab is clicked ([#3288](https://github.com/City-of-Helsinki/yjdh/issues/3288)) ([a7f2d71](https://github.com/City-of-Helsinki/yjdh/commit/a7f2d716ad0cc330520fe3ae03ef42a4b1f630f8))
* Application history did not include change reasons with 0 diffs (hl-1484) ([#3413](https://github.com/City-of-Helsinki/yjdh/issues/3413)) ([031d5bf](https://github.com/City-of-Helsinki/yjdh/commit/031d5bfee7ea4b6e330b13dc7e7c43dc62a3404f))
* Benefit calculation amount in decision summary was 0,00 € ([#3415](https://github.com/City-of-Helsinki/yjdh/issues/3415)) ([c284214](https://github.com/City-of-Helsinki/yjdh/commit/c2842141dd66fbdea339c70fb8efa1ecf7a0c681))
* Bump nextjs version ([#3332](https://github.com/City-of-Helsinki/yjdh/issues/3332)) ([8c8935d](https://github.com/City-of-Helsinki/yjdh/commit/8c8935df53c61546fb1909da6bc1e1f6e9b8a1d3))
* Change outer &lt;a&gt; to &lt;button&gt; to avoid having &lt;a&gt; inside &lt;a&gt; ([#3287](https://github.com/City-of-Helsinki/yjdh/issues/3287)) ([d266b86](https://github.com/City-of-Helsinki/yjdh/commit/d266b86e12d100c8ca45e7116c2f8bb56b10a691))
* Fix a rare case where messages center would crash the app ([cc727a0](https://github.com/City-of-Helsinki/yjdh/commit/cc727a02a2a2c167b2cf7a5ee3f8608f834bda9e))
* **handler:** Remove section and end date when application is not accepted ([#3232](https://github.com/City-of-Helsinki/yjdh/issues/3232)) ([38c2b66](https://github.com/City-of-Helsinki/yjdh/commit/38c2b66303c4a9a06607bdd84955a3af82beb8d4))
* **handler:** Remove unnecessary restrictions for new messages or notes ([#3231](https://github.com/City-of-Helsinki/yjdh/issues/3231)) ([f85cb31](https://github.com/City-of-Helsinki/yjdh/commit/f85cb3140bec8c7435832e4543e964c46232a3ba))
* **handler:** Z-fight issues with header, sidebar, and toasts ([cc7ff47](https://github.com/City-of-Helsinki/yjdh/commit/cc7ff476367ac117346b859dae664f06541258f7))
* Locked user notice bar was on top of new messages list ([#3286](https://github.com/City-of-Helsinki/yjdh/issues/3286)) ([7021896](https://github.com/City-of-Helsinki/yjdh/commit/7021896548bbcdec0f47850faca232db44d3c0c9))
* No need to check batch on application cancel ([#3411](https://github.com/City-of-Helsinki/yjdh/issues/3411)) ([ecdde64](https://github.com/City-of-Helsinki/yjdh/commit/ecdde64bb4fa171c8051e2a7d32c4a67daec2e8a))
* Prevent submit of paperApplicationDate to application of applicant origin ([#3412](https://github.com/City-of-Helsinki/yjdh/issues/3412)) ([78ca125](https://github.com/City-of-Helsinki/yjdh/commit/78ca125e0b71a495adda91f9a7fcb21bd7ccdbe3))
* Remove unnecessary import ([b0b70ee](https://github.com/City-of-Helsinki/yjdh/commit/b0b70ee821e5303d2fcdf7ec147b840dc35d1b7a))
* Remove unnecessary print and useEffect ([687f620](https://github.com/City-of-Helsinki/yjdh/commit/687f6202448bb3c43d2500d8b1b28b6cf073df0d))

## [4.3.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v4.2.0...benefit-handler-v4.3.0) (2024-08-26)


### Features

* Add 'other attachments' file upload dialog to all applications ([#3190](https://github.com/City-of-Helsinki/yjdh/issues/3190)) ([de917de](https://github.com/City-of-Helsinki/yjdh/commit/de917dea4e16652d7b7e6a64369260d8ca1804c6))
* Add alteration count and state to archive listing ([#3198](https://github.com/City-of-Helsinki/yjdh/issues/3198)) ([09a645e](https://github.com/City-of-Helsinki/yjdh/commit/09a645e7a5b5be4638702d5ea639e2965a04e248))
* Add unread messages notifier into header (hl-1410) ([#3214](https://github.com/City-of-Helsinki/yjdh/issues/3214)) ([56a47c3](https://github.com/City-of-Helsinki/yjdh/commit/56a47c304cd1ce866eee81779509ada4d0707f9d))
* Allow handler to mark last application message as unread ([#3120](https://github.com/City-of-Helsinki/yjdh/issues/3120)) (HL-1117) ([79efe24](https://github.com/City-of-Helsinki/yjdh/commit/79efe243d59c113e51182363b7c8ed15029c21e0))
* Improve on table listings (HL-1325) ([#3119](https://github.com/City-of-Helsinki/yjdh/issues/3119)) ([349858f](https://github.com/City-of-Helsinki/yjdh/commit/349858f653e6c7f8926c28821f445fba76e836f7))
* Offset application content when sidebar is open (hl-1200) ([#3189](https://github.com/City-of-Helsinki/yjdh/issues/3189)) ([c1e05a2](https://github.com/City-of-Helsinki/yjdh/commit/c1e05a2923916de27c1966b08feb034416eb8731))


### Bug Fixes

* Add missing localization keys and fix one ([#3224](https://github.com/City-of-Helsinki/yjdh/issues/3224)) ([69ac2d5](https://github.com/City-of-Helsinki/yjdh/commit/69ac2d58715b9c5304104f046abc4b9def8b3329))
* Add monthly pay for manual calculation for accepted application ([#3203](https://github.com/City-of-Helsinki/yjdh/issues/3203)) ([0d59e8d](https://github.com/City-of-Helsinki/yjdh/commit/0d59e8d35171a144159664fc8839f37586e9c996))
* Allow handler to use messenger on accepted/rejected applications ([#3124](https://github.com/City-of-Helsinki/yjdh/issues/3124)) ([b1f72a7](https://github.com/City-of-Helsinki/yjdh/commit/b1f72a751d63e3e69b8bff9ba8717d32b46f5333))
* For some reason new ahjo mode is not on ([3423b9d](https://github.com/City-of-Helsinki/yjdh/commit/3423b9d8fd956ba03af1caef0a5616a38ca70ee2))
* Hotfix table list not crashing the app ([e8acb5b](https://github.com/City-of-Helsinki/yjdh/commit/e8acb5b93ab060080930b74fb9cd486127290fb1))
* New ahjo mode is not on in e2e tests ([faf3c75](https://github.com/City-of-Helsinki/yjdh/commit/faf3c7523644f9d24a5fed598825fb9343302193))
* Remove float to string conversion ([d16171c](https://github.com/City-of-Helsinki/yjdh/commit/d16171cdd30f542d8cfacd33d2e1a60edee24c55))
* Remove irrelevant fields from decision box et cetera ([#3123](https://github.com/City-of-Helsinki/yjdh/issues/3123)) ([46dfc21](https://github.com/City-of-Helsinki/yjdh/commit/46dfc2195c568e6e4ea292eb77e7434ed45d9c7d))
* Remove list items that are handled with new ahjo mode ([#3113](https://github.com/City-of-Helsinki/yjdh/issues/3113)) ([5ea5967](https://github.com/City-of-Helsinki/yjdh/commit/5ea59679d5fd6218639186352d9369d369cd4f8f))
* Reset a few values when apprenticeship or pay subsidy type is changed ([#3218](https://github.com/City-of-Helsinki/yjdh/issues/3218)) ([bed8592](https://github.com/City-of-Helsinki/yjdh/commit/bed859218d78d185d2aaf41bb219ae9129cd5c33))
* Retain or remove training compensation on applicant changes (hl-1184)  ([#3205](https://github.com/City-of-Helsinki/yjdh/issues/3205)) ([de58e4b](https://github.com/City-of-Helsinki/yjdh/commit/de58e4b9e35132080d3a611dd44b22819a53f69f))
* Retain training compensation on edit if apprenticeship still applies ([#3204](https://github.com/City-of-Helsinki/yjdh/issues/3204)) ([651a82c](https://github.com/City-of-Helsinki/yjdh/commit/651a82ca93096dba84cc0eb17a7014249efe2f95))
* State aid max percentage was selected even though prop was null (hl-1185) ([#3207](https://github.com/City-of-Helsinki/yjdh/issues/3207)) ([a46fb10](https://github.com/City-of-Helsinki/yjdh/commit/a46fb1034ea480b4cc7cf8bd46b8b15b2087b15e))
* Validation and fixes to manual calculation (hl-1107) ([#3202](https://github.com/City-of-Helsinki/yjdh/issues/3202)) ([13f1f5b](https://github.com/City-of-Helsinki/yjdh/commit/13f1f5bdf5e6c60f551293e974f64de5202a12c9))

## [4.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v4.1.0...benefit-handler-v4.2.0) (2024-06-24)


### Features

* Add filters to search & improve spreadsheet import (hl-1322) ([#3090](https://github.com/City-of-Helsinki/yjdh/issues/3090)) ([b587b4c](https://github.com/City-of-Helsinki/yjdh/commit/b587b4c1f2dadbcea006c4732005beb471b43f6e))


### Bug Fixes

* Applications would show up in decision list even though complete ([#3097](https://github.com/City-of-Helsinki/yjdh/issues/3097)) ([019d149](https://github.com/City-of-Helsinki/yjdh/commit/019d149103f5c95df5b7daf8eb7cbbd3d0a19810))
* Handle single-day alteration calculation on row terminus date correctly ([#3093](https://github.com/City-of-Helsinki/yjdh/issues/3093)) ([c75a323](https://github.com/City-of-Helsinki/yjdh/commit/c75a323a64ef965bfcd620a37a9f90baf7568062))

## [4.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v4.0.0...benefit-handler-v4.1.0) (2024-06-17)


### Features

* Add alteration handling page with base components ([#3040](https://github.com/City-of-Helsinki/yjdh/issues/3040)) ([ded3f47](https://github.com/City-of-Helsinki/yjdh/commit/ded3f474c27b8800dceccd5003fc11b581936fd2))
* Add application alteration creation for handler UI ([#3075](https://github.com/City-of-Helsinki/yjdh/issues/3075)) (HL-1253) ([1f1c84a](https://github.com/City-of-Helsinki/yjdh/commit/1f1c84a23f1dc8c2fdbebe0e2cf47725d0522fe9))
* Confirmation modal and additional state checks for alteration handler ([#3061](https://github.com/City-of-Helsinki/yjdh/issues/3061)) (HL-1251, HL-1252, HL-1328) ([87e36f8](https://github.com/City-of-Helsinki/yjdh/commit/87e36f8d6f2a825ecfdece6aaf8ec92df5355354))
* Extend access to handler sidebar notes ([#3084](https://github.com/City-of-Helsinki/yjdh/issues/3084)) (HL-1343) ([c3b0820](https://github.com/City-of-Helsinki/yjdh/commit/c3b082027ad31f29b86834b0391bda612a18a77d))
* **handler:** Add seen by applicant in the messaging bar ([#2989](https://github.com/City-of-Helsinki/yjdh/issues/2989)) ([c4eca38](https://github.com/City-of-Helsinki/yjdh/commit/c4eca38e2f0b7f609d61493392fefd7beb9d817a))
* Implement calculator elements for alteration handling ([#3052](https://github.com/City-of-Helsinki/yjdh/issues/3052)) (HL-1155) ([3b3fc93](https://github.com/City-of-Helsinki/yjdh/commit/3b3fc93d0d62b7d21b3ab9e7941e622a99a4591f))
* Implement search feature and GUI to handler's archive (hl-684) ([#3039](https://github.com/City-of-Helsinki/yjdh/issues/3039)) ([fe9112f](https://github.com/City-of-Helsinki/yjdh/commit/fe9112f0c5f612b8c65b990cc210ca2d95d2fbcc))
* Implement the app page components for alterations for handler (HL-1247) ([#2982](https://github.com/City-of-Helsinki/yjdh/issues/2982)) ([ffaee28](https://github.com/City-of-Helsinki/yjdh/commit/ffaee289177fb29e38b2e5bf7c107bbfa1d2826f))
* Import old applications from spreadsheet file (hl-1310) ([#3056](https://github.com/City-of-Helsinki/yjdh/issues/3056)) ([0302394](https://github.com/City-of-Helsinki/yjdh/commit/030239460de752ad03c7aed4d1f1c525449035fc))


### Bug Fixes

* Nonfunctional alteration submission and misc. oversights in date overlap detection ([#3068](https://github.com/City-of-Helsinki/yjdh/issues/3068)) ([9e7dfb9](https://github.com/City-of-Helsinki/yjdh/commit/9e7dfb907e6a69031a9a5bfa98e6f1b61ed7ed4e))
* Prevent app from crashing if application does not have a batch ([bdf394b](https://github.com/City-of-Helsinki/yjdh/commit/bdf394bf352e612cd5da9a745cf36a95b2579ea2))
* Show apps in tabs based on batch status ([e5ffa13](https://github.com/City-of-Helsinki/yjdh/commit/e5ffa13dbfcca5ce769e3d21822b09eaf17e0871))
* Typo in translation key ([bbfaf86](https://github.com/City-of-Helsinki/yjdh/commit/bbfaf86057599b146f3aa9560c62e32d07f7e20e))
* Use correct API endpoint for alteration creation for handler ([#3087](https://github.com/City-of-Helsinki/yjdh/issues/3087)) ([8a4c215](https://github.com/City-of-Helsinki/yjdh/commit/8a4c2150b36fbf950ae13cd70db824bc38ccd43c))

## [4.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-handler-v3.5.0...benefit-handler-v4.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* **backend:** handler is assigned to applicant user if additional information is submitted

### Bug Fixes

* **backend:** Handler is assigned to applicant user if additional information is submitted ([bb7b280](https://github.com/City-of-Helsinki/yjdh/commit/bb7b280c6717bf7cda2e2f5d861c703a5fbeffa4))

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
