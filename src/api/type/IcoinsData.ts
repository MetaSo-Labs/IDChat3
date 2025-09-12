export interface IcoinsData {
  code: number;
  message: string;
  processingTime: number;
  data: SumIcons;
}

export interface SumIcons {
  'brc-20': Brc20;
  brc20_coin: Brc20;
  ft_coin: Ftcoin;
  ft_genesis_coin: Ftgenesiscoin;
  metacontract: Ftgenesiscoin;
  native: Native;
  rune: Rune;
}

export interface Rune {
}

export interface Native {
  BTC: string;
  SPACE: string;
}

export interface Ftgenesiscoin {
  '000221c78c1617fd1322860c63eacd492387979d': string;
  '04e9ec53867bcdc0119d390375ede843e9eaee48': string;
  '07e4c5a9f866164108de005be81d40ccbd2e964c': string;
  '0ce6555c8ec7098e2d97fe239b17e9f616b1d594': string;
  '119946f168cfc2927f1168ab89a70f9bc2f8b837': string;
  '136c10512b90e09f6795f0e7153f9144d392fb3b': string;
  '185b4c8fb97a133f1587411b449d30d87ce7d155': string;
  '185f1e279d6292925b212c30b607588d7e53cd66': string;
  '2cb16123d2473da1972a818af7ed22fafc149f79': string;
  '2ee1af1ae2d3605f08894c17358c99f1fc4c1325': string;
  '54b6067c3100df0329c11d10e3399d97610a203b': string;
  '563e0e48739f3511e9968563cb0affb99fa49007': string;
  '5ba19d7c8cc706357ac25095c599f21d0546e322': string;
  '5cd468bbabd47efe124c8f843bf14d77d3dc9546': string;
  '5db726fd69de8842ef3dc405894e5f7faf0de8a8': string;
  '7c6dabc1fdc3f52c09eda773fc4680ce9157ac96': string;
  '7d4095b45a740634a297bc3edc24dadad2cc9442': string;
  '7e98e1226c539af7705572dfbe2920a3fc97aeb8': string;
  '83b125ad2b872d48a0484977974ed37dd07e7a62': string;
  '8910b2228f2f1709fca090f77907911136707e62': string;
  '8da5a35e9f1ae4b3206aeb3e7bcd758146c27036': string;
  '92cdd1d3887a503b5915fa002488cdb332375192': string;
  '94c2ae3fdbf95a4fb0d788c818cf5fcc7a9aa66a': string;
  '9dc9f09d01037d26ef03f89a0c0113999c7dcc83': string;
  a42b9d344a94aa8c4dd73978f22054ecf3553064: string;
  a431b9832bfe66008f9aa4d5b8159dd06cd7aeee: string;
  b124a2337f1c2186227b556d41d7f642525a7dce: string;
  b2d75931958114e48c9927160f80363eae78e2dc: string;
  c99a688732261295b576dd758b32a09f213358a4: string;
  caefd4745a89f2c09eed38e5674bafd9202274a5: string;
  cdfb69e96cd76fd5d23ca5ee79dbf9e585660a5c: string;
  d14a9fc6e4e3f73b7c7dbc2e1eaaa31d6783a7cc: string;
  dd83082902be080fa6921eeb9271326f76aa59c5: string;
  e0375cc76c9c0de25fc723b7651e12fc50c6defa: string;
  ec1b259d42aa1af103c043b8723343619f4de1b5: string;
  ed40b8788aec47b8c85a2ad79faa238342d0d03f: string;
}

export interface Ftcoin {
  BTC: string;
  MC: string;
  MSP: string;
  MVC: string;
  ORDI: string;
  SHOW: string;
  SPACE: string;
  USDT: string;
  VEMSP: string;
  xingneng: string;
}

export interface Brc20 {
  bili: string;
  btcs: string;
  cats: string;
  fish: string;
  grum: string;
  ibtc: string;
  lger: string;
  ordi: string;
  orxc: string;
  oxbt: string;
  rats: string;
  rdex: string;
  sats: string;
  sayc: string;
  trac: string;
  vmpx: string;
}