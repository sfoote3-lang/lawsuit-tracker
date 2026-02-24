// Maps case-level court strings to circuit keys
export const COURT_TO_CIRCUIT = {
  // 1st Circuit — ME, NH, MA, RI
  'D. Me.':       '1st',
  'D.N.H.':       '1st',
  'D. Mass.':     '1st',
  'D.R.I.':       '1st',
  '1st Circuit':  '1st',

  // 2nd Circuit — NY, CT, VT
  'N.D.N.Y.':         '2nd',
  'S.D.N.Y.':         '2nd',
  'E.D.N.Y.':         '2nd',
  'W.D.N.Y.':         '2nd',
  'D. Conn.':         '2nd',
  'D. Vt.':           '2nd',
  'CIT':              '2nd',   // Court of International Trade, NYC
  'Court of Intl. Trade': '2nd',
  '2nd Circuit':      '2nd',

  // 3rd Circuit — PA, NJ, DE
  'E.D. Pa.':     '3rd',
  'M.D. Pa.':     '3rd',
  'W.D. Pa.':     '3rd',
  'D.N.J.':       '3rd',
  'D. Del.':      '3rd',
  '3rd Circuit':  '3rd',

  // 4th Circuit — MD, VA, WV, NC, SC
  'D. Md.':       '4th',
  'E.D. Va.':     '4th',
  'W.D. Va.':     '4th',
  'N.D.W. Va.':   '4th',
  'M.D.N.C.':     '4th',
  'E.D.N.C.':     '4th',
  'W.D.N.C.':     '4th',
  'D.S.C.':       '4th',
  '4th Circuit':  '4th',

  // 5th Circuit — TX, LA, MS
  'N.D. Tex.':    '5th',
  'S.D. Tex.':    '5th',
  'E.D. Tex.':    '5th',
  'W.D. Tex.':    '5th',
  'E.D. La.':     '5th',
  'M.D. La.':     '5th',
  'W.D. La.':     '5th',
  'N.D. Miss.':   '5th',
  'S.D. Miss.':   '5th',
  '5th Circuit':  '5th',

  // 6th Circuit — OH, MI, KY, TN
  'N.D. Ohio':    '6th',
  'S.D. Ohio':    '6th',
  'E.D. Mich.':   '6th',
  'W.D. Mich.':   '6th',
  'E.D. Ky.':     '6th',
  'W.D. Ky.':     '6th',
  'E.D. Tenn.':   '6th',
  'M.D. Tenn.':   '6th',
  'W.D. Tenn.':   '6th',
  '6th Circuit':  '6th',

  // 7th Circuit — IL, IN, WI
  'N.D. Ill.':    '7th',
  'C.D. Ill.':    '7th',
  'S.D. Ill.':    '7th',
  'N.D. Ind.':    '7th',
  'S.D. Ind.':    '7th',
  'E.D. Wis.':    '7th',
  'W.D. Wis.':    '7th',
  '7th Circuit':  '7th',

  // 8th Circuit — MN, IA, MO, AR, ND, SD, NE
  'D. Minn.':     '8th',
  'N.D. Iowa':    '8th',
  'S.D. Iowa':    '8th',
  'E.D. Mo.':     '8th',
  'W.D. Mo.':     '8th',
  'E.D. Ark.':    '8th',
  'W.D. Ark.':    '8th',
  'D.N.D.':       '8th',
  'D.S.D.':       '8th',
  'D. Neb.':      '8th',
  '8th Circuit':  '8th',

  // 9th Circuit — CA, OR, WA, MT, ID, NV, AZ, AK, HI
  'N.D. Cal.':    '9th',
  'E.D. Cal.':    '9th',
  'C.D. Cal.':    '9th',
  'S.D. Cal.':    '9th',
  'D. Or.':       '9th',
  'W.D. Wash.':   '9th',
  'E.D. Wash.':   '9th',
  'D. Mont.':     '9th',
  'D. Idaho':     '9th',
  'D. Nev.':      '9th',
  'D. Ariz.':     '9th',
  'D. Alaska':    '9th',
  'D. Haw.':      '9th',
  '9th Circuit':  '9th',

  // 10th Circuit — CO, WY, UT, KS, OK, NM
  'D. Colo.':     '10th',
  'D. Wyo.':      '10th',
  'D. Utah':      '10th',
  'D. Kan.':      '10th',
  'W.D. Okla.':   '10th',
  'N.D. Okla.':   '10th',
  'E.D. Okla.':   '10th',
  'D.N.M.':       '10th',
  '10th Circuit': '10th',

  // 11th Circuit — FL, GA, AL
  'N.D. Fla.':    '11th',
  'M.D. Fla.':    '11th',
  'S.D. Fla.':    '11th',
  'N.D. Ga.':     '11th',
  'M.D. Ga.':     '11th',
  'S.D. Ga.':     '11th',
  'N.D. Ala.':    '11th',
  'M.D. Ala.':    '11th',
  'S.D. Ala.':    '11th',
  '11th Circuit': '11th',

  // D.C. Circuit
  'D.D.C.':        'dc',
  'D.C. Circuit':  'dc',
  'D.C. Cir.':     'dc',
  'CADC':          'dc',

  // Special / Article I courts
  'SCOTUS':             'scotus',
  "Ct. Int'l Trade":    'cit',
  'CIT':                'cit',
  'Fed. Claims':        'fed-claims',
  'Fed. Cir.':          'fed-cir',
  'Federal Circuit':    'fed-cir',

  // Circuit court names (e.g. when a case is filed at the circuit level)
  '1st Cir.': '1st', '2nd Cir.': '2nd', '3rd Cir.': '3rd',
  '4th Cir.': '4th', '5th Cir.': '5th', '6th Cir.': '6th',
  '7th Cir.': '7th', '8th Cir.': '8th', '9th Cir.': '9th',
  '10th Cir.': '10th', '11th Cir.': '11th',
}

// Maps US state FIPS codes (as strings) to circuit keys
export const STATE_FIPS_TO_CIRCUIT = {
  // 1st Circuit
  '23': '1st',  // ME
  '33': '1st',  // NH
  '25': '1st',  // MA
  '44': '1st',  // RI

  // 2nd Circuit
  '36': '2nd',  // NY
  '09': '2nd',  // CT
  '50': '2nd',  // VT

  // 3rd Circuit
  '42': '3rd',  // PA
  '34': '3rd',  // NJ
  '10': '3rd',  // DE

  // 4th Circuit
  '24': '4th',  // MD
  '51': '4th',  // VA
  '54': '4th',  // WV
  '37': '4th',  // NC
  '45': '4th',  // SC

  // 5th Circuit
  '48': '5th',  // TX
  '22': '5th',  // LA
  '28': '5th',  // MS

  // 6th Circuit
  '39': '6th',  // OH
  '26': '6th',  // MI
  '21': '6th',  // KY
  '47': '6th',  // TN

  // 7th Circuit
  '17': '7th',  // IL
  '18': '7th',  // IN
  '55': '7th',  // WI

  // 8th Circuit
  '27': '8th',  // MN
  '19': '8th',  // IA
  '29': '8th',  // MO
  '05': '8th',  // AR
  '38': '8th',  // ND
  '46': '8th',  // SD
  '31': '8th',  // NE

  // 9th Circuit
  '06': '9th',  // CA
  '41': '9th',  // OR
  '53': '9th',  // WA
  '30': '9th',  // MT
  '16': '9th',  // ID
  '32': '9th',  // NV
  '04': '9th',  // AZ
  '02': '9th',  // AK
  '15': '9th',  // HI

  // 10th Circuit
  '08': '10th', // CO
  '56': '10th', // WY
  '49': '10th', // UT
  '20': '10th', // KS
  '40': '10th', // OK
  '35': '10th', // NM

  // 11th Circuit
  '12': '11th', // FL
  '13': '11th', // GA
  '01': '11th', // AL

  // D.C. Circuit (DC is a Marker, not a state geography)
  '11': 'dc',
}

// Ordered for display: special courts first, then numbered circuits
export const CIRCUIT_NAMES = {
  // Special federal courts (shown first)
  'scotus':      'Supreme Court',
  'fed-cir':     'Federal Circuit',
  'cit':         "Court of Int'l Trade",
  'fed-claims':  'Court of Federal Claims',
  // D.C. Circuit (most cases filed here)
  'dc':   'D.C. Circuit',
  // Numbered circuits
  '1st':  '1st Circuit',
  '2nd':  '2nd Circuit',
  '3rd':  '3rd Circuit',
  '4th':  '4th Circuit',
  '5th':  '5th Circuit',
  '6th':  '6th Circuit',
  '7th':  '7th Circuit',
  '8th':  '8th Circuit',
  '9th':  '9th Circuit',
  '10th': '10th Circuit',
  '11th': '11th Circuit',
}

// Coordinates for special courts that have no state geography on the map
export const SPECIAL_COURT_COORDS = {
  cit: [-74.013, 40.713],  // Court of International Trade, Manhattan
}
