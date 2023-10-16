# Changelog

## [1.2.0](https://github.com/City-of-Helsinki/yjdh/compare/benefit-backend-v1.1.2...benefit-backend-v1.2.0) (2023-10-16)


### Features

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
