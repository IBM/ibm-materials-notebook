export interface IPrefix {
  symbol: string;
  aliases: string[];
  factor: number;
  type: string;
}

export interface IUnit {
  detail: string;
  description: string;
  symbol: string;
  aliases: string[];
  factor: number;
  type: string;
  base: string;
  min: number;
  max: number;
  regex: RegExp;
}

export enum UNITS {
  DEGK = 'degK',
  DEGC = 'degC',

  //time
  MS = 'ms',
  SEC = 's',
  MIN = 'min',
  HOUR = 'h',
  DAY = 'day',

  //mass
  PG = 'pg',
  NG = 'ng',
  MCG = 'mcg',
  MG = 'mg',
  CG = 'cg',
  DG = 'dg',
  G = 'g',
  DAG = 'dag',
  HG = 'hg',
  KG = 'kg',
  M_G = 'Mg',
  GG = 'Gg',

  //length
  PM = 'pm',
  NM = 'nm',
  MCM = 'mcm',
  MM = 'mm',
  CM = 'cm',
  DM = 'dm',
  M = 'm',
  DAM = 'dam',
  HM = 'hm',
  KM = 'km',
  M_M = 'Mm',
  GM = 'Gm',

  ANG = 'ang',
  _CM = '1/cm',

  //volume
  PL = 'pl',
  NL = 'nl',
  MCL = 'mcl',
  ML = 'ml',
  CL = 'cl',
  DL = 'dl',
  L = 'l',
  DAL = 'dal',
  HL = 'hl',
  KL = 'kl',
  M_L = 'Ml',
  GL = 'Gl',

  //mole
  PMOL = 'pmol',
  NMOL = 'nmol',
  MCMOL = 'mcmol',
  MMOL = 'mmol',
  CMOL = 'cmol',
  DMOL = 'dmol',
  MOL = 'mol',
  DAMOL = 'damol',
  HMOL = 'hmol',
  KMOL = 'kmol',
  M_MOL = 'Mmol',
  GMOL = 'Gmol',

  //pressure
  MBAR = 'mbar',
  BAR = 'bar',
  MTORR = 'mtorr',
  TORR = 'torr',
  PA = 'Pa',
  KPA = 'kPa',
  MPA = 'MPa',
  PSI = 'Psi',
  ATM = 'atm',
  MMHG = 'mmHg',
  INHG = 'inHg',
  CMH2O = 'cmH2O',
  INH2O = 'inH2O',

  //potential
  PV = 'pV',
  NV = 'nV',
  MCV = 'mcV',
  MV = 'mV',
  CV = 'cV',
  DV = 'dV',
  V = 'V',
  DAV = 'daV',
  HV = 'hV',
  KV = 'kV',
  M_V = 'MV',
  GV = 'GV',

  //energy
  PJ = 'pJ',
  NJ = 'nJ',
  MCJ = 'mcJ',
  MJ = 'mJ',
  CJ = 'cJ',
  DJ = 'dJ',
  J = 'J',
  DAJ = 'daJ',
  HJ = 'hJ',
  KJ = 'kJ',
  M_J = 'MJ',
  GJ = 'GJ',

  //power
  PW = 'pW',
  NW = 'nW',
  MCW = 'mcW',
  MW = 'mW',
  CW = 'cW',
  DW = 'dW',
  W = 'W',
  DAW = 'daW',
  HW = 'hW',
  KW = 'kW',
  M_W = 'MW',
  GW = 'GJ',

  //concentration
  MOL_L = 'mol/l',
  MOL_KG = 'mol/kg',
  MCG_ML = 'mcg/ml',
  MG_L = 'mg/l',
  G_ML = 'g/ml',

  //viscosity
  POISE = 'P',
  STOKES = 'St',

  //molecular weight
  G_MOL = 'g/mol',
  Da = 'Da',
  KDa = 'kDa',

  //rate
  DEGC_MIN = 'degC/min',
  DEGK_MIN = 'degK/min',
  MCL_MIN = 'mcl/min',
  NL_MIN = 'nl/min',
  ML_MIN = 'ml/min',
  KPA_S = 'kPa/s',
  RADIAN_S = 'rad/s',
  RPM = 'rpm',

  //fraction
  PERCENT = '%',
  MOL_PERCENT = 'mol%',
  MOL_FRACTION = 'molX',
  WT_PERCENT = 'wt%',

  //area
  MW_CM2 = 'mW/cm^2',
}
