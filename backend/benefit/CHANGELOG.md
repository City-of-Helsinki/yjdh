# Changelog

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
