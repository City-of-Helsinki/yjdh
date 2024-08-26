# Changelog

## [3.13.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.12.0...benefit-applicant-v3.13.0) (2024-08-26)


### Features

* Allow handler to mark last application message as unread ([#3120](https://github.com/City-of-Helsinki/yjdh/issues/3120)) (HL-1117) ([79efe24](https://github.com/City-of-Helsinki/yjdh/commit/79efe243d59c113e51182363b7c8ed15029c21e0))
* Hide decisionSummary if details unreceived from ahjo ([#3216](https://github.com/City-of-Helsinki/yjdh/issues/3216)) ([ec07dd4](https://github.com/City-of-Helsinki/yjdh/commit/ec07dd4d97a8a375130ff4371afcdc4783eccf73))


### Bug Fixes

* Chat is open until it's archived for applicant ([#3209](https://github.com/City-of-Helsinki/yjdh/issues/3209)) ([03283ab](https://github.com/City-of-Helsinki/yjdh/commit/03283abb270e88e1844f23b81f8c58da6d0124d9))
* Fix applicant messager drawer refusing to close in some cases ([#3110](https://github.com/City-of-Helsinki/yjdh/issues/3110)) (HL-1345) ([13b4eee](https://github.com/City-of-Helsinki/yjdh/commit/13b4eee53918297bb0ce98b05f34e7974749187e))
* Remove irrelevant fields from decision box et cetera ([#3123](https://github.com/City-of-Helsinki/yjdh/issues/3123)) ([46dfc21](https://github.com/City-of-Helsinki/yjdh/commit/46dfc2195c568e6e4ea292eb77e7434ed45d9c7d))
* Reset a few values when apprenticeship or pay subsidy type is changed ([#3218](https://github.com/City-of-Helsinki/yjdh/issues/3218)) ([bed8592](https://github.com/City-of-Helsinki/yjdh/commit/bed859218d78d185d2aaf41bb219ae9129cd5c33))
* Retain or remove training compensation on applicant changes (hl-1184)  ([#3205](https://github.com/City-of-Helsinki/yjdh/issues/3205)) ([de58e4b](https://github.com/City-of-Helsinki/yjdh/commit/de58e4b9e35132080d3a611dd44b22819a53f69f))

## [3.12.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.11.0...benefit-applicant-v3.12.0) (2024-06-17)


### Features

* Add alteration handling page with base components ([#3040](https://github.com/City-of-Helsinki/yjdh/issues/3040)) ([ded3f47](https://github.com/City-of-Helsinki/yjdh/commit/ded3f474c27b8800dceccd5003fc11b581936fd2))
* Add application alteration creation for handler UI ([#3075](https://github.com/City-of-Helsinki/yjdh/issues/3075)) (HL-1253) ([1f1c84a](https://github.com/City-of-Helsinki/yjdh/commit/1f1c84a23f1dc8c2fdbebe0e2cf47725d0522fe9))
* **applicant:** Display chat icon in app view for statuses "accepted", "rejected" (hl-1292) ([#3046](https://github.com/City-of-Helsinki/yjdh/issues/3046)) ([fe856be](https://github.com/City-of-Helsinki/yjdh/commit/fe856bea20fbdc890d2f8cc57cd0f504b0d216a7))
* Confirmation modal and additional state checks for alteration handler ([#3061](https://github.com/City-of-Helsinki/yjdh/issues/3061)) (HL-1251, HL-1252, HL-1328) ([87e36f8](https://github.com/City-of-Helsinki/yjdh/commit/87e36f8d6f2a825ecfdece6aaf8ec92df5355354))
* Implement calculator elements for alteration handling ([#3052](https://github.com/City-of-Helsinki/yjdh/issues/3052)) (HL-1155) ([3b3fc93](https://github.com/City-of-Helsinki/yjdh/commit/3b3fc93d0d62b7d21b3ab9e7941e622a99a4591f))
* Implement the app page components for alterations for handler (HL-1247) ([#2982](https://github.com/City-of-Helsinki/yjdh/issues/2982)) ([ffaee28](https://github.com/City-of-Helsinki/yjdh/commit/ffaee289177fb29e38b2e5bf7c107bbfa1d2826f))
* Show de minimis status in the decision box for applicant ([#3085](https://github.com/City-of-Helsinki/yjdh/issues/3085)) (HL-1266) ([e511717](https://github.com/City-of-Helsinki/yjdh/commit/e5117172964d8635c40a98e50a054339898a7407))


### Bug Fixes

* Batch in applicantApplication error ([#3062](https://github.com/City-of-Helsinki/yjdh/issues/3062)) ([86c52e8](https://github.com/City-of-Helsinki/yjdh/commit/86c52e8e2b976774ac8f8b66db7b71b51f0dba7b))
* Date picking fails on month change ([8681c03](https://github.com/City-of-Helsinki/yjdh/commit/8681c03d97ea5d0eb3ccee91e891830a40d23d17))
* Include archive status flag in application list query key ([#3082](https://github.com/City-of-Helsinki/yjdh/issues/3082)) ([99d21c9](https://github.com/City-of-Helsinki/yjdh/commit/99d21c9e4b2c728a0e6579d0b6356f8bb7b6c4be))
* Possibility to open messenger for cancelled application ([#3069](https://github.com/City-of-Helsinki/yjdh/issues/3069)) ([4f75c38](https://github.com/City-of-Helsinki/yjdh/commit/4f75c3813ec75a1154c52f1619b8507b52e636d6))

## [3.11.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.10.0...benefit-applicant-v3.11.0) (2024-05-14)


### Features

* Enhance error notifications when uploading malformed or malwared file (hl-1267) ([#2973](https://github.com/City-of-Helsinki/yjdh/issues/2973)) ([cd61403](https://github.com/City-of-Helsinki/yjdh/commit/cd614030233cf69b36e49a23869d82be4aa9b776))
* **handler:** Add error validation logic and toast for de minimis aid form (HL-1202) ([#2933](https://github.com/City-of-Helsinki/yjdh/issues/2933)) ([752d9eb](https://github.com/City-of-Helsinki/yjdh/commit/752d9ebf75406b3616a6dfba791aa73f54cdf311))


### Bug Fixes

* Filter batches using auto_generated_by_ahjo value (hl-1304) ([#2979](https://github.com/City-of-Helsinki/yjdh/issues/2979)) ([f6a8c64](https://github.com/City-of-Helsinki/yjdh/commit/f6a8c64b759df6e5f2bcee9c22abc19a0c4eeefd))
* **frontend:** Don't use cross-env in scripts, didn't work in pipelines ([628d466](https://github.com/City-of-Helsinki/yjdh/commit/628d466c58fbbff7bf79e11f92a89ef9a2822439))
* **frontend:** Use cross-env in scripts to make them cross-platform ([7307e57](https://github.com/City-of-Helsinki/yjdh/commit/7307e5797d6b0a0bc24eded97d6724a5724a4547))
* Loc key added for application.handling & .cancelled ([#2962](https://github.com/City-of-Helsinki/yjdh/issues/2962)) ([045f045](https://github.com/City-of-Helsinki/yjdh/commit/045f045c6a0eb230b81891e8da3ef0a428153727))
* Make start and end date relative to current date ([cef205f](https://github.com/City-of-Helsinki/yjdh/commit/cef205f2745159a40621da74d463110820e46be1))
* Move alteration guide infobox to archive page ([#2985](https://github.com/City-of-Helsinki/yjdh/issues/2985)) (HL-1284) ([0bcf707](https://github.com/City-of-Helsinki/yjdh/commit/0bcf7078adc27b6e07ed44ba2ddfe45463df479e))
* Patch vulnerable pdf libraries ([e7240ff](https://github.com/City-of-Helsinki/yjdh/commit/e7240ff167242dc28172fed2eee9a56cee1227af))
* Resolve issues with start date on handler's side (HL-1270) ([#2948](https://github.com/City-of-Helsinki/yjdh/issues/2948)) ([090fe5e](https://github.com/City-of-Helsinki/yjdh/commit/090fe5ef82e0a1fe5a905fdd55f5139fa416952c))

## [3.10.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.9.0...benefit-applicant-v3.10.0) (2024-04-19)


### Features

* Add reminder about alterations to applicant main page (HL-1100) ([#2927](https://github.com/City-of-Helsinki/yjdh/issues/2927)) ([bc04999](https://github.com/City-of-Helsinki/yjdh/commit/bc04999e169c2ba18a113aa9d78cc5821cdb25f9))
* ClamAV malware scanning for attachments ([#2894](https://github.com/City-of-Helsinki/yjdh/issues/2894)) ([56e640b](https://github.com/City-of-Helsinki/yjdh/commit/56e640bbd5a53dd2401e61b6f1d719a85b248b27))
* Implement new Ahjo process UI for handler (HL-1167) ([8f3d591](https://github.com/City-of-Helsinki/yjdh/commit/8f3d5914d4828b5f8985f88e7485a5be32a12e31))
* Implement the existing alteration list and alteration deletion for the applicant (HL-1154) ([#2925](https://github.com/City-of-Helsinki/yjdh/issues/2925)) ([aea007f](https://github.com/City-of-Helsinki/yjdh/commit/aea007f32f8620ac81417d7a2cf7d0556454e262))


### Bug Fixes

* Added missing localizations and better de minimis text (Hl-1236) ([#2905](https://github.com/City-of-Helsinki/yjdh/issues/2905)) ([d6c2d4f](https://github.com/City-of-Helsinki/yjdh/commit/d6c2d4fad9480e0feee9d978056e2ed6e46e15ea))
* **applicant:** Add more logic to disable/enable save and close button ([#2918](https://github.com/City-of-Helsinki/yjdh/issues/2918)) ([ef38ce4](https://github.com/City-of-Helsinki/yjdh/commit/ef38ce415e1f389821e100a60bf1c31c8aa582ee))
* No apprenticeship information should be required for applicant without pay subsidy (HL-1257) ([#2909](https://github.com/City-of-Helsinki/yjdh/issues/2909)) ([278985b](https://github.com/City-of-Helsinki/yjdh/commit/278985b42d72b7b9b4de8623d4e107874d76fa17))
* Require apprenticeship file only if pay subsidy is granted (HL-1262) ([#2930](https://github.com/City-of-Helsinki/yjdh/issues/2930)) ([8ead4a2](https://github.com/City-of-Helsinki/yjdh/commit/8ead4a2706aa1cb4e3a4fcb6b3a8a854d16db069))
* Validation minimum for start date should be 4 months earlier, not 6 ([#2908](https://github.com/City-of-Helsinki/yjdh/issues/2908)) ([ffe3daf](https://github.com/City-of-Helsinki/yjdh/commit/ffe3daf9f670a8712bb86f9fdc5c801c75355ce5))

## [3.9.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.8.0...benefit-applicant-v3.9.0) (2024-04-04)


### Features

* Add decision details information box to application page ([aaf7794](https://github.com/City-of-Helsinki/yjdh/commit/aaf7794044057f17d1ed99c39f6301a5f2d6826f))
* Implement application alteration submission flow ([ebbe9e5](https://github.com/City-of-Helsinki/yjdh/commit/ebbe9e5fd2cb21ec457845e5fe16cdfa617e655a))


### Bug Fixes

* Applicant - invalidate cache to prevent wrong application mode (HL-1183) ([#2901](https://github.com/City-of-Helsinki/yjdh/issues/2901)) ([e3b26b4](https://github.com/City-of-Helsinki/yjdh/commit/e3b26b4750df694e28d6e3630970ee616004acaa))
* Convert spaces to dashes in ahjo case page link ([#2897](https://github.com/City-of-Helsinki/yjdh/issues/2897)) ([a9fc149](https://github.com/City-of-Helsinki/yjdh/commit/a9fc14963d50c6f596911bdb0b079e5ce4cc3b1b))

## [3.8.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v3.7.0...benefit-applicant-v3.8.0) (2024-03-15)


### Features

* Review application edit changes before submit (hl-1062) ([#2838](https://github.com/City-of-Helsinki/yjdh/issues/2838)) ([2d9c08e](https://github.com/City-of-Helsinki/yjdh/commit/2d9c08e6dc33bd03d390408131db0445e2c7e517))


### Bug Fixes

* Import date-fns properly ([#2878](https://github.com/City-of-Helsinki/yjdh/issues/2878)) ([0f5f858](https://github.com/City-of-Helsinki/yjdh/commit/0f5f858adca19fc19579bb1db13c3bf1449485ca))
* Remove unnecessary forward slash from url ([b9dce62](https://github.com/City-of-Helsinki/yjdh/commit/b9dce62cd9356e3a0ee738b67c3897e7cff1d3fb))

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
