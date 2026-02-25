// Judicial rulings in Trump administration cases.
// Each entry represents one notable ruling.
//
// party:   'D' = appointed by Democratic president (Clinton, Obama, Biden)
//          'R' = appointed by Republican president (Reagan, Bush 41/43, Trump)
// ruling:  'against' = ruled against the administration
//          'for'     = ruled for the administration
// caseHref: optional — path to open when dot is clicked (otherwise filters by court)
//
// NOTE: This data is representative of the overall pattern of rulings
// in the tracked cases. Update entries with specific judge names and
// citations as they are verified against court records.

export const JUDICIAL_RULINGS = [
  // ── Ruled AGAINST Administration ──────────────────────────────────────

  // Immigration
  { id: 1,  party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Blocked nationwide expedited removal expansion',                  caseHref: '/cases?q=expedited+removal&level=district' },
  { id: 2,  party: 'R', ruling: 'against', court: 'W.D. Wash.', note: 'Blocked birthright citizenship EO — "blatantly unconstitutional"', caseHref: '/cases?q=birthright+citizenship&level=district' },
  { id: 3,  party: 'D', ruling: 'against', court: 'N.D. Cal.',  note: 'Ordered DHS to honor CBP One appointments',                      caseHref: '/cases?q=CBP+One&level=district' },
  { id: 4,  party: 'D', ruling: 'against', court: 'S.D.N.Y.',   note: 'Blocked birthright citizenship enforcement (NY coalition)',       caseHref: '/cases?q=birthright+citizenship&level=district' },
  { id: 5,  party: 'D', ruling: 'against', court: 'D. Mass.',   note: 'Blocked birthright citizenship enforcement (MA coalition)',       caseHref: '/cases?q=birthright+citizenship&level=district' },
  { id: 6,  party: 'D', ruling: 'against', court: 'D. Md.',     note: 'Blocked birthright citizenship enforcement (MD coalition)',       caseHref: '/cases?q=birthright+citizenship&level=district' },
  { id: 7,  party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Preliminary injunction — expedited removal',                     caseHref: '/cases?q=expedited+removal&level=district' },

  // Executive Power / DOGE
  { id: 8,  party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Emergency TRO blocking DOGE Treasury access',                    caseHref: '/cases?topic=executive-power&level=district' },
  { id: 9,  party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Extended DOGE Treasury access restriction',                      caseHref: '/cases?topic=executive-power&level=district' },
  { id: 10, party: 'D', ruling: 'against', court: 'N.D. Cal.',  note: 'TRO blocking mass OPM probationary terminations',                caseHref: '/cases?topic=executive-power&level=district' },
  { id: 11, party: 'D', ruling: 'against', court: 'N.D. Cal.',  note: 'Preliminary injunction — federal worker reinstatement',          caseHref: '/cases?topic=executive-power&level=district' },
  { id: 12, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'CFPB shutdown blocked — congressionally mandated agency',        caseHref: '/cases?topic=executive-power&level=district' },
  { id: 13, party: 'R', ruling: 'against', court: 'D. Md.',     note: 'DOGE authority challenge — standing preserved',                  caseHref: '/cases?topic=executive-power&level=district' },

  // Civil Rights
  { id: 14, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'DEI executive order injunction granted',                         caseHref: '/cases?topic=civil-rights&level=district' },
  { id: 15, party: 'D', ruling: 'against', court: 'D. Md.',     note: 'Federal DEI program termination blocked',                        caseHref: '/cases?topic=civil-rights&level=district' },
  { id: 16, party: 'D', ruling: 'against', court: 'N.D. Cal.',  note: 'LGBTQ+ employment protections upheld',                           caseHref: '/cases?topic=civil-rights&level=district' },
  { id: 17, party: 'R', ruling: 'against', court: 'W.D. Wash.', note: 'Transgender military ban TRO granted',                           caseHref: '/cases?topic=civil-rights&level=district' },
  { id: 18, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Civil rights enforcement rollback blocked',                      caseHref: '/cases?topic=civil-rights&level=district' },

  // Environment
  { id: 19, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'EPA rollback — emergency injunction',                            caseHref: '/cases?topic=environment&level=district' },
  { id: 20, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Clean energy funding freeze blocked',                            caseHref: '/cases?topic=environment&level=district' },
  { id: 21, party: 'D', ruling: 'against', court: 'D. Or.',     note: 'Federal lands executive order halted',                           caseHref: '/cases?topic=environment&level=district' },
  { id: 22, party: 'D', ruling: 'against', court: 'D. Mont.',   note: 'Mining permit expansion blocked',                                caseHref: '/cases?topic=environment&level=district' },

  // Healthcare
  { id: 23, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Medicaid work requirements blocked',                             caseHref: '/cases?topic=healthcare&level=district' },
  { id: 24, party: 'D', ruling: 'against', court: 'D. Mass.',   note: 'ACA subsidy cuts halted',                                       caseHref: '/cases?topic=healthcare&level=district' },

  // Education
  { id: 25, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Title IX rollback blocked',                                      caseHref: '/cases?topic=education&level=district' },
  { id: 26, party: 'D', ruling: 'against', court: 'D. Minn.',   note: 'MN v. Noem — TRO granted, state crime scene access',            caseHref: '/case/gemini-test' },

  // Free Speech / Press
  { id: 27, party: 'D', ruling: 'against', court: 'D.D.C.',     note: 'Press credential revocation injunction',                         caseHref: '/cases?topic=free-speech&level=district' },
  { id: 28, party: 'R', ruling: 'against', court: 'D.D.C.',     note: 'First Amendment challenge permitted to proceed',                 caseHref: '/cases?topic=free-speech&level=district' },

  // ── Ruled FOR Administration ──────────────────────────────────────────

  { id: 29, party: 'R', ruling: 'for', court: '5th Circuit',    note: 'Upheld Remain in Mexico policy reinstatement',                   caseHref: '/cases?topic=immigration&level=appeals' },
  { id: 30, party: 'R', ruling: 'for', court: '5th Circuit',    note: 'Cartel FTO designation — admin authority upheld',                caseHref: '/cases?topic=immigration&level=appeals' },
  { id: 31, party: 'R', ruling: 'for', court: 'W.D. Tex.',      note: 'Border enforcement executive authority upheld',                  caseHref: '/cases?topic=immigration&level=district' },
  { id: 32, party: 'R', ruling: 'for', court: 'CIT',            note: 'IEEPA jurisdictional challenge dismissed',                       caseHref: '/cases?topic=foreign-policy&level=district' },
  { id: 33, party: 'D', ruling: 'for', court: 'N.D. Cal.',      note: 'Emergency TRO denied — irreparable harm standard not met',       caseHref: '/cases?status=active&level=district' },
  { id: 34, party: 'D', ruling: 'for', court: 'D.D.C.',         note: 'Emergency stay denied — plaintiffs lacked standing',             caseHref: '/cases?status=active&level=district' },
  { id: 35, party: 'R', ruling: 'for', court: '9th Circuit',    note: 'Emergency stay of district court injunction granted',            caseHref: '/cases?level=appeals' },
]

// Derived aggregate stats
export const RULING_STATS = (() => {
  const dem   = p => p === 'D'
  const rep   = p => p === 'R'
  const ag    = r => r.ruling === 'against'
  const fo    = r => r.ruling === 'for'
  return {
    totalAgainst: JUDICIAL_RULINGS.filter(ag).length,
    totalFor:     JUDICIAL_RULINGS.filter(fo).length,
    demAgainst:   JUDICIAL_RULINGS.filter(r => dem(r.party) && ag(r)).length,
    demFor:       JUDICIAL_RULINGS.filter(r => dem(r.party) && fo(r)).length,
    repAgainst:   JUDICIAL_RULINGS.filter(r => rep(r.party) && ag(r)).length,
    repFor:       JUDICIAL_RULINGS.filter(r => rep(r.party) && fo(r)).length,
  }
})()
