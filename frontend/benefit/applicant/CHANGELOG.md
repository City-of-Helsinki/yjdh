# Changelog

## [3.7.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.6.0...benefit-applicant-v3.7.0) (2024-02-14)


### Features

* Add navigation and a new page for processed applications ([128023c](https://github.com/City-of-Helsinki/yjdh/commit/128023c7777b4090cefe554296c8d46dd9ea7066))
* Adjust benefit applicant front page appearance ([2c1418c](https://github.com/City-of-Helsinki/yjdh/commit/2c1418cb9c9b25db30e4963c06e8957f9bb5bb36))
* Edit application form with handler GUI (HL-990) ([#2764](https://github.com/City-of-Helsinki/yjdh/issues/2764)) ([40cb66f](https://github.com/City-of-Helsinki/yjdh/commit/40cb66fba2cca156dbbb60c128eb5f88a7ca1743))
* List old processed applications on the archive page (HL-1011) ([72ed278](https://github.com/City-of-Helsinki/yjdh/commit/72ed27869efa89551092028800e6c402ab69321d))

## [3.6.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.5.0...benefit-applicant-v3.6.0) (2024-01-16)


### Features

* Applicant landing page adjustments (HL-1033) ([#2709](https://github.com/City-of-Helsinki/yjdh/issues/2709)) ([bb5a55d](https://github.com/City-of-Helsinki/yjdh/commit/bb5a55d48714177c867702c276a49ce754ed2e9b))
* Applicant messenger should be disabled if app is in a batch (hl-1059) ([#2619](https://github.com/City-of-Helsinki/yjdh/issues/2619)) ([fe0995f](https://github.com/City-of-Helsinki/yjdh/commit/fe0995fe1ee96414f36ab113de88b7b81054eec6))


### Bug Fixes

* App crash on empty calculations (HL-1041) ([#2688](https://github.com/City-of-Helsinki/yjdh/issues/2688)) ([728af1f](https://github.com/City-of-Helsinki/yjdh/commit/728af1f79200b1b524569ca80716b6be6de316d7))
* Benefit applicant is now safe for search robots ([180be58](https://github.com/City-of-Helsinki/yjdh/commit/180be58885683877fef0c640dcdcc987e60b21d5))
* Upgrade all Finnish SSN related code to support new format ([490fd61](https://github.com/City-of-Helsinki/yjdh/commit/490fd610a11ac9eef0a181350b1a1af4c232a566))

## [3.5.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.4.0...benefit-applicant-v3.5.0) (2024-01-03)


### Features

* Show "no cookie consents" notification (HL-1078) ([#2623](https://github.com/City-of-Helsinki/yjdh/issues/2623)) ([aca3fe0](https://github.com/City-of-Helsinki/yjdh/commit/aca3fe0bccd9e7a0494b842f1086c344b896905c))


### Bug Fixes

* Askem issues solved (HL-1094) ([#2676](https://github.com/City-of-Helsinki/yjdh/issues/2676)) ([6e503d9](https://github.com/City-of-Helsinki/yjdh/commit/6e503d943340d172d102a43b3263f305e7fd65cb))
* HL-1093 year 2024 bug ([#2684](https://github.com/City-of-Helsinki/yjdh/issues/2684)) ([b5c94c4](https://github.com/City-of-Helsinki/yjdh/commit/b5c94c40449a47ac4524d2c3c5fedc1fab15fa6b))
* Start_date can now be in the future ([#2686](https://github.com/City-of-Helsinki/yjdh/issues/2686)) ([4137a9c](https://github.com/City-of-Helsinki/yjdh/commit/4137a9c489cbc648610f9b3d67d063c8f4b52624))

## [3.4.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.3.1...benefit-applicant-v3.4.0) (2023-12-21)


### Features

* Cookie settings page (HL-1077) ([#2616](https://github.com/City-of-Helsinki/yjdh/issues/2616)) ([173eb3b](https://github.com/City-of-Helsinki/yjdh/commit/173eb3bae1818d1f31abe2ae1eae8ad666622d19))
* Don't assume but actually implement form submission state ([#2607](https://github.com/City-of-Helsinki/yjdh/issues/2607)) ([acd3b38](https://github.com/City-of-Helsinki/yjdh/commit/acd3b3847fde9b3827915563d2f0e508a52a5348))


### Bug Fixes

* Don't send application id to askem (HL-1089) ([#2624](https://github.com/City-of-Helsinki/yjdh/issues/2624)) ([0720e28](https://github.com/City-of-Helsinki/yjdh/commit/0720e289365774a34551df12af545c4dd8b7b1c3))
* Yup fails to validate 0 as min value ([e4127b8](https://github.com/City-of-Helsinki/yjdh/commit/e4127b89ccde1681644ee7e9af9a33f2728c6f34))

## [3.3.1](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.3.0...benefit-applicant-v3.3.1) (2023-12-13)


### Bug Fixes

* Cookie banner fix (HL-909) ([#2596](https://github.com/City-of-Helsinki/yjdh/issues/2596)) ([2426c5f](https://github.com/City-of-Helsinki/yjdh/commit/2426c5f14ecb0d761cdf13b8e7c27f431b931039))

## [3.3.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.2.0...benefit-applicant-v3.3.0) (2023-12-07)


### Features

* Add Askem feedback buttons (HL-922) ([5e6911e](https://github.com/City-of-Helsinki/yjdh/commit/5e6911ea4d6fdd52a0a76119311b4f6469d53ee5))
* Add cookie consents modal (HL-909) ([4325ed4](https://github.com/City-of-Helsinki/yjdh/commit/4325ed4ede6c3dbb2baaeefc849c4252cca77984))
* Full pdf summary of applications (HL-708, HL-903) ([#2524](https://github.com/City-of-Helsinki/yjdh/issues/2524)) ([644aaf1](https://github.com/City-of-Helsinki/yjdh/commit/644aaf1d13532acbcbc2f1252335a1ff7f88405d))
* Open drawer on click of new messages bar ([#2492](https://github.com/City-of-Helsinki/yjdh/issues/2492)) ([11c80ab](https://github.com/City-of-Helsinki/yjdh/commit/11c80abd7ae4536db45c0d26f507af705f6fdc37))


### Bug Fixes

* Application pdf summary improvements ([#2537](https://github.com/City-of-Helsinki/yjdh/issues/2537)) ([8b86192](https://github.com/City-of-Helsinki/yjdh/commit/8b861927ee6a1ae333f43702be9351a29011393f))
* Application summary pdf issues found during tests ([#2547](https://github.com/City-of-Helsinki/yjdh/issues/2547)) ([a838481](https://github.com/City-of-Helsinki/yjdh/commit/a8384811ab08a033acf9bd4dfb424fd60dd7e56e))
* New version of employee concent files ([#2568](https://github.com/City-of-Helsinki/yjdh/issues/2568)) ([8df0441](https://github.com/City-of-Helsinki/yjdh/commit/8df04415986dbbc443b0ea7d84456eff31de88fd))
* Sort imports DateInput ([4325ed4](https://github.com/City-of-Helsinki/yjdh/commit/4325ed4ede6c3dbb2baaeefc849c4252cca77984))
* Wrap i18n key with translation fuction ([#2483](https://github.com/City-of-Helsinki/yjdh/issues/2483)) ([051469d](https://github.com/City-of-Helsinki/yjdh/commit/051469d148f280448b447c44cd801f91e9021ac3))

## [3.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.1.0...benefit-applicant-v3.2.0) (2023-11-14)


### Features

* Update finnish-ssn to 2.1.1 (HL-662) ([#2439](https://github.com/City-of-Helsinki/yjdh/issues/2439)) ([caad473](https://github.com/City-of-Helsinki/yjdh/commit/caad47333be57fd04c5fe57272f1b0832fad46e5))


### Bug Fixes

* Check for field is touched AND has an error; HL-1005 ([#2379](https://github.com/City-of-Helsinki/yjdh/issues/2379), [#2403](https://github.com/City-of-Helsinki/yjdh/issues/2403)) ([c1776b9](https://github.com/City-of-Helsinki/yjdh/commit/c1776b985235665d78922624063b26e66c2f4435))
* HL-1005, HL-916,  ([#2379](https://github.com/City-of-Helsinki/yjdh/issues/2379)) ([779bed2](https://github.com/City-of-Helsinki/yjdh/commit/779bed2787ef7cc0c11f9e49d3b85a9bd891174c))
* Lint files ([#2405](https://github.com/City-of-Helsinki/yjdh/issues/2405)) ([ca48b3d](https://github.com/City-of-Helsinki/yjdh/commit/ca48b3d8a475f309cec1e17e8cb38e230d35c96f))
* Wrong object accessed for English terms HL-1031 ([#2438](https://github.com/City-of-Helsinki/yjdh/issues/2438)) ([c5e53b7](https://github.com/City-of-Helsinki/yjdh/commit/c5e53b79f594b878bf72c70f1735366f1367a310))

## [3.1.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.0.0...benefit-applicant-v3.1.0) (2023-10-23)


### Features

* Renew application overview step (HL-945) ([#2334](https://github.com/City-of-Helsinki/yjdh/issues/2334)) ([196af97](https://github.com/City-of-Helsinki/yjdh/commit/196af9722c47a18e20bee696f02d1ac06f847da3))
* Restyle "application sent" notification (HL-948, HL-947) ([#2350](https://github.com/City-of-Helsinki/yjdh/issues/2350)) ([1e0f251](https://github.com/City-of-Helsinki/yjdh/commit/1e0f251a9c68fdfea90b1215aff15156e7f86f6b))
* Small tweaks to login styles (HL-940) ([#2340](https://github.com/City-of-Helsinki/yjdh/issues/2340)) ([4fd815e](https://github.com/City-of-Helsinki/yjdh/commit/4fd815ecfa828b33a863627010f9c9b9820ee25a))
* Use custom translation for attachement of pay subsidy for people 55+ (HL-944) ([#2349](https://github.com/City-of-Helsinki/yjdh/issues/2349)) ([4fdf1f5](https://github.com/City-of-Helsinki/yjdh/commit/4fdf1f51437533173b856f89d82864a683003e48))


### Bug Fixes

* Accessibility statement corrections for en/sv ([#2324](https://github.com/City-of-Helsinki/yjdh/issues/2324)) ([b73b243](https://github.com/City-of-Helsinki/yjdh/commit/b73b2434e1318ab46396bc46dd511427d7483d67))
* Application is no longer 404'd on creation and navigation ([#2338](https://github.com/City-of-Helsinki/yjdh/issues/2338)) ([ccbed72](https://github.com/City-of-Helsinki/yjdh/commit/ccbed721c2841edaab9075b1e9dcd1708442d20d))
* Resolve various browser test issues ([ccdce19](https://github.com/City-of-Helsinki/yjdh/commit/ccdce1905261f28c313ef272f88eb00485510d25))
* Various bug fixes (HL-1001, HL-1004) ([#2326](https://github.com/City-of-Helsinki/yjdh/issues/2326)) ([ea54019](https://github.com/City-of-Helsinki/yjdh/commit/ea5401943b1cedb66b4ebb0236b10d0fb1abb144))

## [3.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v2.0.0...benefit-applicant-v3.0.0) (2023-10-04)


### ⚠ BREAKING CHANGES

* renew application forms to conform to new terms

### Features

* Renew application forms to conform to new terms ([de31e8a](https://github.com/City-of-Helsinki/yjdh/commit/de31e8a5b3d4ff0b4d24466e37f30b8067617831))


### Bug Fixes

* Conditional pay subsidy percentage for not_granted ([536dbe4](https://github.com/City-of-Helsinki/yjdh/commit/536dbe42235f96b359691fdb6fc2982c5644b84a))
* Disappearing de minimis aid rows and grantedAt datepicker ([7cb55e2](https://github.com/City-of-Helsinki/yjdh/commit/7cb55e2e6f83af3b3e5f7abaea32a4a1ba11df5b))
* Require collective agreement field on application form ([8cd3355](https://github.com/City-of-Helsinki/yjdh/commit/8cd335542a31d5ffd1f9b9e1ff7baaa2ae9100e8))
* Require salary and expenses to be 0 - 99999 ([f76916f](https://github.com/City-of-Helsinki/yjdh/commit/f76916f78c91e5193318bd75af7cfbb461990fec))
* Send default paySubsidyPercent value (HL-995) ([#2311](https://github.com/City-of-Helsinki/yjdh/issues/2311)) ([c6c1abc](https://github.com/City-of-Helsinki/yjdh/commit/c6c1abcdbb8fe1332da19decf53d84a56b615a30))
* Set CSRF header instantly when getting token ([#2261](https://github.com/City-of-Helsinki/yjdh/issues/2261)) ([9d8009d](https://github.com/City-of-Helsinki/yjdh/commit/9d8009df4bf549ec2c93d5cbb9b4e7cff54fcb3a))

## [2.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v1.0.0...benefit-applicant-v2.0.0) (2023-08-30)


### ⚠ BREAKING CHANGES

* see if pdf views work in production

### Features

* Hide handler and applicant from search engines ([510a1cd](https://github.com/City-of-Helsinki/yjdh/commit/510a1cdd7678ed3be4ca14ead2ae182eabf2bf24))
* **ks-employer-frontend:** Autofill employee data ([f1258f6](https://github.com/City-of-Helsinki/yjdh/commit/f1258f6889ac6dd97fe5e3c621795dbfa2b3a0d8))
* Send language to backend on language selection ([f94eb18](https://github.com/City-of-Helsinki/yjdh/commit/f94eb1807d8ed0a271c1aba5901a0ec7292ff413))
* Show toast error on unfinished de minimis aid; set radio to false if no deminimis aids ([fa62b90](https://github.com/City-of-Helsinki/yjdh/commit/fa62b9093145d86a6dafd2d83fd740eac8b3bba1))
* Tooltips now break text content on CR + LF ([06a2cb7](https://github.com/City-of-Helsinki/yjdh/commit/06a2cb706151d928ee6a5376bbf5feff8da6303a))
* Use sms style layout for chats in applicant and handler ([c0ba913](https://github.com/City-of-Helsinki/yjdh/commit/c0ba913db40cea2d59235b819a8ce07a418ea5b9))


### Bug Fixes

* Add a two-col grid for 576-768px devices ([667085d](https://github.com/City-of-Helsinki/yjdh/commit/667085dfadc084a28f4c52c795a5f36d2c4c67e9))
* Add responsive behaviour to application list view ([4f0a1fd](https://github.com/City-of-Helsinki/yjdh/commit/4f0a1fdd3b4e3ca128bedeb078627f884c7af34b))
* Add responsive behaviour to main page title and action button ([4813272](https://github.com/City-of-Helsinki/yjdh/commit/4813272b3c34396a8b4af82e785de210cbf422fa))
* Container would overflow in x direction; stepper as own row ([3665977](https://github.com/City-of-Helsinki/yjdh/commit/36659776ce2c100511e02914c25c08e086e67ddb))
* Do not obscure view with terms on a11y statement page ([91e8acd](https://github.com/City-of-Helsinki/yjdh/commit/91e8acdbd36661419948d82777288c262d4f26b0))
* Never use formik values as they are updated to context anyways ([221c072](https://github.com/City-of-Helsinki/yjdh/commit/221c07208ce39bf08221036db8b1b3a2029a6f96))
* PDF no longer fixed to 700px scroll; adjust button layout ([45dbf39](https://github.com/City-of-Helsinki/yjdh/commit/45dbf39901020338048da396321791a9688ac562))
* Pdf.js as public assets using webpack configuration ([25d8875](https://github.com/City-of-Helsinki/yjdh/commit/25d8875669270b95263b251f092609be6f6e43db))
* Some favicons had wrong asset path ([4eae5a3](https://github.com/City-of-Helsinki/yjdh/commit/4eae5a3dd0fa507d6e7c25404c15b2d9014f6882))
* Step4's "upload" button would float over "print" button ([1e5edd9](https://github.com/City-of-Helsinki/yjdh/commit/1e5edd9d0eb9c2803cd9c9f1f01adab3d7d747a6))
* Toast had no translation for close button label ([8449135](https://github.com/City-of-Helsinki/yjdh/commit/84491350ddbf7806854b27fce6ec5cef6b8b509b))
* Use correct aria-label for mobile menu ([db53941](https://github.com/City-of-Helsinki/yjdh/commit/db53941be30cd8aae405a2363a1e0d5e39bf923b))
* Use same process to validate unfinished deminimis row on save ([bc21c9b](https://github.com/City-of-Helsinki/yjdh/commit/bc21c9be3c504a96ca792f2ac1885ce3246e6fed))


### Miscellaneous Chores

* Remove weird pdf.js CDN link ([493bb26](https://github.com/City-of-Helsinki/yjdh/commit/493bb2643ed0ed42de6482d4766be52d220a5df1))
