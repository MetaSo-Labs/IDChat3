export interface RootDataObject {
  code: number;
  message: string;
  processingTime: number;
  data: Object;
}

export interface RootDataObject2 {
  code: number;
  message: string;
  processingTime: number;
  data: MvcApiResponse;
}

interface MvcApiResponse {
  list: Object;
}

export interface RootDataObject3 {
  code: number;
  message: string;
  processingTime: number;
  data: ApiResponse;
}

interface ApiResponse {
  list: [];
}

// interface Data {
//   priceInfo: Object;
// }

// interface PriceInfo {
//   '04b82dc8446f3d8b47ee1b2d4269f74383a45595acb73e4e4378620805fe259ai0/TTC': number;
//   '0b91873c7e7d1dd924011182de6b5f4d0752f3571b8543b9d622d217b7f9c84fi0/BTCDOGS': number;
//   '103229ba5a91af4e5bc4cc6e030cf50c5016ba0f26d4956386b0e49eeeee3154i0/FREPAVEL': number;
//   '10fcd36eaf5cb380cd1a31995ba89c58e785bb5593e75dff8dd8dfc5be811a74i0/TESTCOIN': number;
//   '121a9362a8ffaeb13650591b1accde32a22037eb2aa85ab88a2647f7ed0e8b46i0/BPIZZA': number;
//   '12502a055106a66341f09f762690bd678a1943e3e0d3d6625f5f70f7cc68e729i0/METALD': number;
//   '2727c581926ddb0050347612868ddf769ec847f646a664626394901aae2ae61di0/BTCGOLD': number;
//   '292e268d109d3e1e0b67d0d93297180ddbb7603d70d879b847c1ec3f3f6b6fb6i0/SHOWCOIN': number;
//   '2bcd284d43fec25107251365f79d85df59e77e76ec3413f8de130eccb24f0f93i0/DUCAT': number;
//   '300d363c86b6cfa9ab0054eb3ef5743d2bea8689e5d5c6350528fbb05092121ci0/BTCDOG(FAKE)': number;
//   '391fcfb92237a0b78385f701fb3588d189db07ee7bf378c3ea922f49211dc6a6i0/SOTESHI': number;
//   '435f22feb7a44785dff8c9f4202ac4011aebf9fe84df8d32a148d964c71b7713i0/SCAT': number;
//   '45661ba91682f65e5f73432e5629070a36bf6a4802ae5e6a5acab881254a49f8i0/TICKET': number;
//   '45cbb4c5065ed391ebfa0c5d3eaa0f588545b50471f6d3745c1a08e578d8750ci0/MIGGLES': number;
//   '56906d43174a8a8ca5e71af69b25e7a2bc5a468847fbb8840f9b5fb412ae2c8fi0/FOXY': number;
//   '5896654ce91180f1993274d905020081ad7e6a5aa053659d5c50992482fd0f97i0/WUKONG': number;
//   '6b1d9109ddfe29dbf9f40c793921f9fb397fc41f9814796b00413da599dbe168i0/TRUMPFRE': number;
//   '733521c747879ca16f9dd438a0ada6bdfd44ad8e8f48684b82adb75ddd258d3ci0/BTCDOGE': number;
//   '7371035e2f64b149ecb6e4a8ef07032074c466e6ab81710694c3a7a9c98ddb7ei0/NEIRO': number;
//   '7d308282bd6e9f51ebdfb7cad0e2fcd752d40a57b49446798fc660d5c15934a0i0/METACOIN': number;
//   '7d581fcc5344dc6c511b9fdd244ccc1f5f88a7daa503ba14d1fa12c5005e565fi0/JASON': number;
//   '8035e34441309cb22f750d86c07579775162b02e4237d1b37ae09f1cd429c974i0/BANANA': number;
//   '805b702626773d39e564203c1427e8469c6f2cc036faea19f999e72b0414ca79i0/ALPACA': number;
//   '923a9d2d182f04dd2c1c3b010dae13d944da96b5534f79b61e722b667843d507i0/LUCKY': number;
//   '99d6d218369790883d395f5e54aa44547e46da3cee55bb7bb8d4b484ecaa095ci0/BCAT': number;
//   '9c4abfb487155908ee62dcd1a682ccbb4ba273ed4ca710d2bc46ce4e4a328784i0/BULLBTC': number;
//   'a17ec286e1fa692eece15f5b19b53fdd3acad5907e30d5e2524a4beef0b88b19i0/BTCHAIN': number;
//   'a4ef6a2bac17d1a6502b7913c4628d1ca3471ea58856537f868c6cb35065c3eai0/DOG': number;
//   'ab2063ec35961197bea23a193267aaeda1246c9a618005a5f11ae8b298bc3d58i0/PLANET': number;
//   'ab429f80c4d71601aaa9eb9177bbb953f3dd08e866dbcf62434c210408c60523i0/PUPS': number;
//   'adf8808602f029aecd00557ff380c9fcc0ce90899923e4de7103798418fc766di0/ZHUBAJIE': number;
//   'bc97f504703e4f5153db7c0b8ceefc2761dfaebc234de595158c4e47817e9598i0/BRETT': number;
//   'c2ee6f9f35a21b904ad58feb4463961dd8d686d8afdc67ec2beb427586563a8ai0/BTCDOG': number;
//   'c91ad66657195e96785124b5ddcb540b8d5ca766229679990c9f09b4d0c230e8i0/TOPDOG': number;
//   'ca8ffe8ea339deebec5f22795f055d61ed32372f6f8f22af16708a04d1b13064i0/FEG': number;
//   'cb731ebd3a9da8bece2b55834efb9f100d695e80dac041827e431a3170f7728ci0/OWL': number;
//   'ce8e7d99eb6a454f13512244ac4c6c49c125ce0fba125bb8b849570cd220ef18i0/METABOT': number;
//   'd3ddb36429720f53d953a8ea95e755de825ae256725570b432edd5a659b71765i0/BUTT': number;
//   'd698a781bd29c6d73880c466948fdda0d5c580ff83dab7d0ff0de96b37f52d38i0/MAD': number;
//   'd9b72f9f5afe4189908b3094cfc537031a34b992b409ff4bb81bcdbaa004b618i0/PEZZA': number;
//   'daf424c03eecdb4b8b2a228850d2f0668905758d20e85cb41b3b4a52073ba761i0/FANS': number;
//   'e277e5e33a89dbb1888e913332a15d1f318181f7b98046b7fc96ce8f0d65e78ei0/SPACEX': number;
//   'e79d1adba443c5cc28809757ba5b5778ed2c904f495935b3b7990a58a9eb6c42i0/BTCCATS': number;
//   'e9ada7f50f1317de47a799ff58eb5a95c2dfcc19ca1c23afd9839ab59d840bd3i0/TOSHI': number;
//   'f1e872c10e350a48418683e883c1a33f48265c26ac499aaf13f663383dd13d75i0/LEMH': number;
//   'f29e87317455639e45e42eb42b69f7d1fd396aab4ae4aa2d6e21768f71b7a8c1i0/WZRD': number;
//   'f6cd592a6a4db04c9394584cf124776eb0f0e5af54f286a2fad3856d40b0127ei0/BBZ': number;
//   'f8511d1bd6d024c816c9a075556b82126f5a5f696ca1909e9685aed65a5a019ci0/HOT-DOG': number;
//   'fa945b247cce757bbf011275b3278c5e073e3e60b4f8ad221b31d02561ebb719i0/BTCPEPE': number;
//   'fde947fe5cb16f350e26d2e5af669490b0a2f5a5aed0deb9e2e5ca101cdc880ei0/SWK': number;
//   'fe6709713d2194202a42c41109054352650ec1779dced31196c1bea5e6b5d697i0/TIT': number;
// }
