# Changelog

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
