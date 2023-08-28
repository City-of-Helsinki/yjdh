# Changelog

## [2.0.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-applicant-v1.0.0...benefit-applicant-v2.0.0) (2023-08-28)


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
* PDF no longer fixed to 700px scroll; adjust button layout ([45dbf39](https://github.com/City-of-Helsinki/yjdh/commit/45dbf39901020338048da396321791a9688ac562))
* Pdf.js as public assets using webpack configuration ([25d8875](https://github.com/City-of-Helsinki/yjdh/commit/25d8875669270b95263b251f092609be6f6e43db))
* Some favicons had wrong asset path ([4eae5a3](https://github.com/City-of-Helsinki/yjdh/commit/4eae5a3dd0fa507d6e7c25404c15b2d9014f6882))
* Step4's "upload" button would float over "print" button ([1e5edd9](https://github.com/City-of-Helsinki/yjdh/commit/1e5edd9d0eb9c2803cd9c9f1f01adab3d7d747a6))
* Toast had no translation for close button label ([8449135](https://github.com/City-of-Helsinki/yjdh/commit/84491350ddbf7806854b27fce6ec5cef6b8b509b))
* Use correct aria-label for mobile menu ([db53941](https://github.com/City-of-Helsinki/yjdh/commit/db53941be30cd8aae405a2363a1e0d5e39bf923b))


### Miscellaneous Chores

* Remove weird pdf.js CDN link ([493bb26](https://github.com/City-of-Helsinki/yjdh/commit/493bb2643ed0ed42de6482d4766be52d220a5df1))
