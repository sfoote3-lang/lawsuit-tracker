// court status values: 'active' | 'completed' | 'anticipated'
// timeline event type values: 'admin-action' | 'filed' | 'hearing' | 'tro' | 'injunction' | 'ruling-for' | 'ruling-against' | 'appeal' | 'dismissed'
// court field on timeline events: present when a court is the actor; omitted for admin-action

export const ISSUES = [
  {
    slug: 'immigration',
    title: 'Immigration',
    color: '#e63946',
    description:
      'Legal challenges to executive orders and policies on border enforcement, deportation programs, asylum restrictions, and immigration status.',
    stats: [
      { number: 80,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#e63946', delay: 0 },
      { number: 45,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 22,  label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 13,  label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'imm-001',
        example: true,
        name: 'ACLU v. DHS',
        status: 'injunction',
        court: 'D.D.C.',
        dateFiled: '2025-01-25',
        description: 'Challenge to the expansion of expedited removal to the interior of the country beyond the 100-mile border zone.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'completed' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'active' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Executive Order Signed', description: 'President Trump signs executive order directing DHS to expand expedited removal to the full extent permitted under statute, covering the entire country.' , key: true },
          { date: '2025-01-25', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'ACLU files suit in D.D.C. on behalf of immigrants\' rights organizations, arguing the expansion exceeds statutory authority and violates due process.', key: true },
          { date: '2025-01-28', type: 'hearing', court: 'D.D.C.', title: 'Emergency TRO Hearing', description: 'Judge holds emergency hearing on plaintiffs\' motion for a temporary restraining order.', key: false },
          { date: '2025-02-03', type: 'tro', court: 'D.D.C.', title: 'TRO Granted', description: 'Court issues a temporary restraining order halting enforcement of the expanded expedited removal policy pending a full injunction hearing.', key: true },
          { date: '2025-02-18', type: 'injunction', court: 'D.D.C.', title: 'Preliminary Injunction Granted', description: 'Judge converts TRO to a preliminary injunction, finding plaintiffs are likely to succeed on the merits that the order exceeds DHS statutory authority.', key: true },
          { date: '2025-02-20', type: 'appeal', court: 'D.C. Circuit', title: 'Government Appeals to D.C. Circuit', description: 'DOJ files notice of appeal and emergency motion to stay the injunction with the U.S. Court of Appeals for the D.C. Circuit.', key: false },
        ],
      },
      {
        id: 'imm-002',
        example: true,
        name: 'State of New York v. Trump',
        status: 'active',
        court: 'S.D.N.Y.',
        dateFiled: '2025-02-03',
        description: 'Multi-state challenge to executive order ending birthright citizenship for children of undocumented immigrants.',
        courts: [
          { name: 'W.D. Wash.', type: 'District Court', status: 'completed' },
          { name: 'S.D.N.Y.', type: 'District Court', status: 'active' },
          { name: '2nd Circuit', type: 'Court of Appeals', status: 'anticipated' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Executive Order on Birthright Citizenship', description: 'President Trump signs order directing agencies to cease recognizing birthright citizenship for children born in the U.S. to parents who are undocumented or on temporary visas.', key: true },
          { date: '2025-01-22', type: 'hearing', court: 'W.D. Wash.', title: 'Emergency Hearings in Multiple Courts', description: 'Federal judges in Massachusetts, Maryland, and Washington State hold emergency hearings on TRO requests filed by state coalitions.', key: false },
          { date: '2025-01-23', type: 'tro', court: 'W.D. Wash.', title: 'Nationwide TRO Issued', description: 'A federal judge in Seattle issues a nationwide TRO blocking the order, calling it "blatantly unconstitutional" under the 14th Amendment.', key: true },
          { date: '2025-02-03', type: 'filed', court: 'S.D.N.Y.', title: 'New York-Led Coalition Files Suit', description: '22 state attorneys general file a consolidated complaint in S.D.N.Y. seeking a permanent injunction and declaratory judgment.', key: true },
          { date: '2025-02-15', type: 'hearing', court: 'S.D.N.Y.', title: 'Oral Argument Scheduled', description: 'Court schedules oral argument on cross-motions for summary judgment, with nationwide TRO remaining in effect.', key: false },
        ],
      },
      {
        id: 'imm-003',
        example: true,
        name: 'ILRC v. Noem',
        status: 'injunction',
        court: 'N.D. Cal.',
        dateFiled: '2025-01-28',
        description: 'Challenge to suspension of the CBP One app and cancellation of previously approved parole appointments.',
        courts: [
          { name: 'N.D. Cal.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'CBP One App Shut Down', description: 'DHS abruptly shuts down the CBP One app within hours of the inauguration, canceling tens of thousands of pre-approved appointments for migrants to enter legally at ports of entry.', key: true },
          { date: '2025-01-28', type: 'filed', court: 'N.D. Cal.', title: 'Complaint Filed', description: 'Immigrant Legal Resource Center and affected individuals file suit arguing the abrupt cancellation violated due process rights of people who had received approved appointments.', key: true },
          { date: '2025-02-04', type: 'hearing', court: 'N.D. Cal.', title: 'Preliminary Injunction Hearing', description: 'Court hears arguments on whether to issue a preliminary injunction requiring DHS to honor previously approved CBP One appointments.', key: false },
          { date: '2025-02-10', type: 'injunction', court: 'N.D. Cal.', title: 'Partial Injunction Granted', description: 'Judge grants a partial injunction requiring DHS to process individuals who had valid CBP One appointments as of January 20, 2025.', key: true },
          { date: '2025-02-17', type: 'hearing', court: 'N.D. Cal.', title: 'Compliance Hearing', description: 'Court holds hearing to assess whether DHS is complying with the injunction order.', key: false },
        ],
      },
      {
        id: 'imm-004',
        example: true,
        name: 'Las Americas v. Trump',
        status: 'active',
        court: 'W.D. Tex.',
        dateFiled: '2025-02-10',
        description: 'Challenge to the designation of cartels as foreign terrorist organizations and its application to asylum seekers.',
        courts: [
          { name: 'W.D. Tex.', type: 'District Court', status: 'active' },
          { name: '5th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Cartels Designated as FTOs', description: 'President Trump signs executive order directing the State Department to designate major Mexican cartels as Foreign Terrorist Organizations, with implications for immigration proceedings.', key: true },
          { date: '2025-01-31', type: 'admin-action', title: 'DHS Issues Implementation Guidance', description: 'DHS issues guidance directing immigration judges to apply the FTO designation to deny asylum claims, treating any contact with cartel-controlled territory as grounds for inadmissibility.', key: true },
          { date: '2025-02-10', type: 'filed', court: 'W.D. Tex.', title: 'Complaint Filed', description: 'Las Americas Immigrant Advocacy Center files suit arguing the blanket application to asylum seekers violates the Immigration and Nationality Act and the Convention Against Torture.', key: true },
          { date: '2025-02-19', type: 'hearing', court: 'W.D. Tex.', title: 'Scheduling Conference', description: 'Court holds scheduling conference and sets briefing schedule on plaintiffs\' motion for a preliminary injunction.', key: false },
        ],
      },
      {
        id: 'imm-005',
        example: true,
        name: 'RAICES v. DHS',
        status: 'closed-against',
        court: '5th Circuit',
        dateFiled: '2025-01-30',
        description: 'Challenge to family separation policy reinstated under the "Remain in Mexico" framework. Court ruled against plaintiffs.',
        courts: [
          { name: '5th Circuit', type: 'Court of Appeals', status: 'completed' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Remain in Mexico Reinstated', description: 'Administration reinstates the Migrant Protection Protocols ("Remain in Mexico") policy, requiring asylum seekers to wait in Mexico while their cases are adjudicated in U.S. immigration courts.', key: true },
          { date: '2025-01-30', type: 'filed', court: '5th Circuit', title: 'Complaint Filed — Direct Appeal', description: 'RAICES files suit in S.D. Tex., transferred to 5th Cir. on direct appeal given prior circuit precedent on Remain in Mexico.', key: true },
          { date: '2025-02-06', type: 'hearing', court: '5th Circuit', title: 'Three-Judge Panel Convened', description: 'The 5th Circuit convenes a three-judge panel for expedited review given prior circuit precedent on Remain in Mexico.', key: false },
          { date: '2025-02-14', type: 'ruling-for', court: '5th Circuit', title: 'Court Rules for Administration', description: 'Three-judge panel upholds the policy 2-1, finding the administration acted within its statutory authority and prior 5th Circuit precedent forecloses the plaintiffs\' claims.', key: true },
          { date: '2025-02-19', type: 'appeal', court: '5th Circuit', title: 'Petition for Rehearing En Banc Filed', description: 'Plaintiffs petition for rehearing before the full 5th Circuit, arguing the panel decision conflicts with Supreme Court precedent.', key: false },
        ],
      },
    ],
  },

  {
    slug: 'executive-power',
    title: 'Executive Power / DOGE',
    color: '#f4a261',
    description:
      'Cases challenging the scope of executive authority, including the Department of Government Efficiency\'s access to federal data systems, mass agency layoffs, and the dismantling of congressionally created agencies.',
    stats: [
      { number: 95,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#f4a261', delay: 0 },
      { number: 60,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 30,  label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 5,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'ep-001',
        example: true,
        name: 'AFGE v. OPM',
        status: 'injunction',
        court: 'N.D. Cal.',
        dateFiled: '2025-02-05',
        description: 'Federal employee unions challenge mass layoffs of probationary workers across dozens of agencies without congressional authorization.',
        courts: [
          { name: 'N.D. Cal.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'OPM Directive Issued', description: 'OPM issues a government-wide directive ordering agencies to identify and terminate probationary employees within 30 days, affecting approximately 200,000 federal workers.', key: true },
          { date: '2025-02-05', type: 'filed', court: 'N.D. Cal.', title: 'Complaint Filed', description: 'American Federation of Government Employees and allied unions file suit in N.D. Cal. challenging the mass terminations as violating the Civil Service Reform Act and constitutional separation of powers.', key: true },
          { date: '2025-02-10', type: 'tro', court: 'N.D. Cal.', title: 'TRO Granted', description: 'Judge issues a temporary restraining order blocking OPM from implementing the directive, finding that Congress, not the President, controls federal hiring and firing procedures.', key: true },
          { date: '2025-02-14', type: 'hearing', court: 'N.D. Cal.', title: 'Preliminary Injunction Hearing', description: 'Court holds full evidentiary hearing on plaintiffs\' motion for a preliminary injunction.', key: false },
          { date: '2025-02-18', type: 'injunction', court: 'N.D. Cal.', title: 'Preliminary Injunction Issued', description: 'Court converts TRO to a preliminary injunction requiring agencies to reinstate terminated probationary employees while litigation proceeds.', key: true },
        ],
      },
      {
        id: 'ep-002',
        example: true,
        name: 'NTEU v. Vought',
        status: 'injunction',
        court: 'D.D.C.',
        dateFiled: '2025-02-07',
        description: 'Challenge to DOGE\'s access to Treasury Department payment systems containing sensitive data for millions of Americans.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-27', type: 'admin-action', title: 'DOGE Granted Treasury System Access', description: 'Acting OMB Director grants DOGE personnel read/write access to Treasury\'s payment processing system, which processes $6 trillion in annual federal payments including Social Security and Medicare.', key: true },
          { date: '2025-02-07', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'National Treasury Employees Union and state AGs file suit arguing the access violates the Privacy Act, the Federal Reserve Act, and the Appropriations Clause.', key: true },
          { date: '2025-02-09', type: 'tro', court: 'D.D.C.', title: 'Emergency TRO Granted', description: 'Federal judge issues emergency TRO within 48 hours of filing, immediately revoking DOGE\'s write access to Treasury systems.', key: true },
          { date: '2025-02-13', type: 'hearing', court: 'D.D.C.', title: 'Injunction Hearing', description: 'Court holds hearing on whether to extend the restriction. Government argues DOGE access is necessary for fiscal oversight.', key: false },
          { date: '2025-02-16', type: 'injunction', court: 'D.D.C.', title: 'Injunction Extended', description: 'Judge extends the restriction on DOGE\'s access, requiring any future access requests to be submitted to the court for approval.', key: true },
        ],
      },
      {
        id: 'ep-003',
        example: true,
        name: 'State of New Mexico v. Musk',
        status: 'active',
        court: 'D.N.M.',
        dateFiled: '2025-02-12',
        description: 'State challenges DOGE\'s authority to operate without congressional oversight or Senate confirmation of its leadership.',
        courts: [
          { name: 'D.N.M.', type: 'District Court', status: 'active' },
          { name: '10th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'DOGE Established by Executive Order', description: 'President Trump establishes the Department of Government Efficiency via executive order, appointing Elon Musk as a "special government employee" to lead it without Senate confirmation.', key: true },
          { date: '2025-02-01', type: 'admin-action', title: 'DOGE Begins Agency Restructuring', description: 'DOGE personnel embed in multiple federal agencies, conducting reviews and recommending elimination of programs, raising questions about their legal authority.', key: false },
          { date: '2025-02-12', type: 'filed', court: 'D.N.M.', title: 'Complaint Filed', description: 'New Mexico and 17 other states file suit arguing DOGE functions as an advisory committee subject to FACA, and its leadership role requires Senate confirmation under the Appointments Clause.', key: true },
          { date: '2025-02-20', type: 'hearing', court: 'D.N.M.', title: 'Motion to Dismiss Hearing Scheduled', description: 'Court schedules hearing on the government\'s motion to dismiss, arguing states lack standing and DOGE is merely an advisory body.', key: false },
        ],
      },
      {
        id: 'ep-004',
        example: true,
        name: 'CFPB Employees v. Trump',
        status: 'injunction',
        court: 'D.D.C.',
        dateFiled: '2025-02-09',
        description: 'Challenge to executive order shuttering the Consumer Financial Protection Bureau, a congressionally created agency.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-02-03', type: 'admin-action', title: 'Acting CFPB Director Orders Work Stoppage', description: 'Newly appointed Acting CFPB Director Russell Vought orders all employees to stop work, closes the agency\'s headquarters, and signals intent to dismantle it.', key: true },
          { date: '2025-02-05', type: 'admin-action', title: 'CFPB Moves to Withdraw Pending Rules', description: 'Acting director moves to withdraw all pending CFPB rulemaking proceedings and return funds to Treasury, seeking to effectively zero out agency operations.', key: false },
          { date: '2025-02-09', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'CFPB employees union files suit arguing the dismantling violates the Consumer Financial Protection Act, which makes the CFPB Director removable only for cause and establishes the agency\'s independent funding mechanism.', key: true },
          { date: '2025-02-12', type: 'tro', court: 'D.D.C.', title: 'TRO Granted', description: 'Court issues TRO barring Acting Director from taking further steps to dismantle the agency or terminate employees pending full hearing.', key: true },
          { date: '2025-02-19', type: 'injunction', court: 'D.D.C.', title: 'Preliminary Injunction Entered', description: 'Judge issues preliminary injunction requiring the Acting Director to permit employees to continue performing their statutory functions.', key: true },
        ],
      },
    ],
  },

  {
    slug: 'civil-rights',
    title: 'Civil Rights',
    color: '#a8dadc',
    description:
      'Lawsuits challenging rollbacks of civil rights protections, including anti-DEI executive orders, attacks on gender-affirming care, and restrictions on voting rights enforcement.',
    stats: [
      { number: 70,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#a8dadc', delay: 0 },
      { number: 48,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 18,  label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 4,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'cr-001',
        example: true,
        name: 'NAACP LDF v. Trump',
        status: 'injunction',
        court: 'D. Md.',
        dateFiled: '2025-01-22',
        description: 'Challenge to executive order eliminating DEI programs and offices across the federal government and federal contractors.',
        courts: [
          { name: 'D. Md.', type: 'District Court', status: 'active' },
          { name: '4th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Anti-DEI Executive Order Signed', description: 'President Trump signs executive orders directing all federal agencies to terminate DEI offices, DEI staff positions, and DEI-related contracts with federal contractors.', key: true },
          { date: '2025-01-22', type: 'filed', court: 'D. Md.', title: 'Complaint Filed', description: 'NAACP Legal Defense Fund and coalition of civil rights organizations file suit in D. Md. arguing the orders violate the First and Fifth Amendments and Title VII.', key: true },
          { date: '2025-01-27', type: 'tro', court: 'D. Md.', title: 'Partial TRO Granted', description: 'Judge grants TRO blocking enforcement of the contractor certification requirement, which required contractors to certify they have no DEI programs, finding it likely constitutes compelled speech.', key: true },
          { date: '2025-02-10', type: 'injunction', court: 'D. Md.', title: 'Preliminary Injunction on Contractor Provisions', description: 'Court extends injunction to cover the contractor certification requirement, allowing other provisions to take effect while the case proceeds.', key: true },
          { date: '2025-02-18', type: 'hearing', court: 'D. Md.', title: 'Summary Judgment Briefing Ordered', description: 'Judge orders expedited summary judgment briefing on the First Amendment contractor speech claims.', key: false },
        ],
      },
      {
        id: 'cr-002',
        example: true,
        name: 'Lambda Legal v. HHS',
        status: 'injunction',
        court: 'W.D. Wash.',
        dateFiled: '2025-01-29',
        description: 'Challenge to executive order banning gender-affirming care for minors and directing federal agencies to cease funding for such care.',
        courts: [
          { name: 'W.D. Wash.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Executive Order on Gender-Affirming Care', description: 'President Trump signs order directing HHS to cease funding gender-affirming care for minors through any federal program, including Medicaid and CHIP, and directing states to follow suit as a condition of federal funding.', key: true },
          { date: '2025-01-29', type: 'filed', court: 'W.D. Wash.', title: 'Complaint Filed', description: 'Lambda Legal and ACLU file suit on behalf of transgender youth and their families arguing the order violates the equal protection guarantee and exceeds the executive\'s authority over federal spending.', key: true },
          { date: '2025-02-03', type: 'tro', court: 'W.D. Wash.', title: 'Nationwide TRO Granted', description: 'Federal judge issues nationwide TRO blocking implementation, finding the funding cutoff would cause irreparable harm to minors currently receiving care.', key: true },
          { date: '2025-02-14', type: 'injunction', court: 'W.D. Wash.', title: 'Preliminary Injunction Granted', description: 'Court converts TRO to preliminary injunction blocking the Medicaid and CHIP funding cutoff, finding plaintiffs are substantially likely to succeed on their Spending Clause claims.', key: true },
        ],
      },
      {
        id: 'cr-003',
        example: true,
        name: 'GLAD v. DoD',
        status: 'active',
        court: 'D. Mass.',
        dateFiled: '2025-02-01',
        description: 'Challenge to reinstatement of the ban on transgender individuals serving in the military.',
        courts: [
          { name: 'D. Mass.', type: 'District Court', status: 'active' },
          { name: '1st Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Transgender Military Ban Reinstated', description: 'President Trump signs executive order directing the Secretary of Defense to reinstate the policy prohibiting transgender individuals from serving in the military, reversing Biden-era policy.', key: true },
          { date: '2025-01-28', type: 'admin-action', title: 'DoD Implementation Memo Issued', description: 'Secretary of Defense issues memorandum directing branch chiefs to begin discharging service members who have received a gender dysphoria diagnosis, with a 30-day implementation period.', key: false },
          { date: '2025-02-01', type: 'filed', court: 'D. Mass.', title: 'Complaint Filed', description: 'GLBTQ Legal Advocates & Defenders file suit on behalf of active-duty transgender service members challenging the ban as unconstitutional sex discrimination.', key: true },
          { date: '2025-02-11', type: 'hearing', court: 'D. Mass.', title: 'TRO Hearing', description: 'Court hears emergency arguments. Government argues prior Supreme Court precedent from the first Trump term forecloses a TRO.', key: false },
          { date: '2025-02-13', type: 'hearing', court: 'D. Mass.', title: 'TRO Denied — Case Proceeds on Expedited Schedule', description: 'Judge declines to issue a TRO but allows the case to proceed on an expedited schedule, finding the constitutional questions merit full briefing.', key: false },
        ],
      },
      {
        id: 'cr-004',
        example: true,
        name: 'National Women\'s Law Center v. ED',
        status: 'active',
        court: 'D.D.C.',
        dateFiled: '2025-02-14',
        description: 'Challenge to the Department of Education\'s rescission of Title IX guidance protecting LGBTQ+ students.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Biden-Era Title IX Guidance Rescinded', description: 'Department of Education rescinds 2021 and 2024 guidance documents that interpreted Title IX\'s sex discrimination protections to cover gender identity, and reinstates a narrower 2020 interpretation.', key: true },
          { date: '2025-02-05', type: 'admin-action', title: 'New Title IX Q&A Published', description: 'ED publishes new Q&A document directing schools to treat students according to their biological sex for purposes of bathrooms, locker rooms, and athletic competition.', key: false },
          { date: '2025-02-14', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'National Women\'s Law Center and LGBTQ+ advocacy groups file suit arguing the rescission was arbitrary and capricious under the APA and violates notice-and-comment requirements.', key: true },
          { date: '2025-02-21', type: 'hearing', court: 'D.D.C.', title: 'Preliminary Conference Set', description: 'Court schedules a preliminary conference to set a briefing schedule on plaintiffs\' pending motion for expedited preliminary injunction briefing.', key: false },
        ],
      },
    ],
  },

  {
    slug: 'environment',
    title: 'Environment',
    color: '#57cc99',
    description:
      'Cases challenging rollbacks of environmental regulations, withdrawal from the Paris Climate Agreement, and the opening of protected federal lands to drilling and mining.',
    stats: [
      { number: 55,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#57cc99', delay: 0 },
      { number: 38,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 12,  label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 5,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'env-001',
        example: true,
        name: 'Earthjustice v. EPA',
        status: 'injunction',
        court: 'D.C. Circuit',
        dateFiled: '2025-01-27',
        description: 'Challenge to the EPA\'s rollback of methane emission standards for oil and gas operations.',
        courts: [
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'active' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'EPA Directed to Suspend Methane Rules', description: 'President Trump signs executive order directing EPA to suspend enforcement of Biden-era methane emission standards and initiate rulemaking to rescind them.', key: true },
          { date: '2025-01-24', type: 'admin-action', title: 'EPA Issues Enforcement Suspension Notice', description: 'EPA publishes notice suspending all enforcement actions under the methane standards and inviting industry to request waivers from existing compliance obligations.', key: false },
          { date: '2025-01-27', type: 'filed', court: 'D.C. Circuit', title: 'Petition for Review Filed', description: 'Earthjustice and coalition of environmental groups file petition for review in D.C. Circuit, arguing the suspension violated the Clean Air Act\'s mandatory rulemaking procedures.', key: true },
          { date: '2025-02-06', type: 'tro', court: 'D.C. Circuit', title: 'Administrative Stay Granted', description: 'D.C. Circuit grants an administrative stay of the enforcement suspension pending full briefing, citing the importance of the environmental and procedural questions.', key: true },
          { date: '2025-02-18', type: 'hearing', court: 'D.C. Circuit', title: 'Oral Argument Expedited', description: 'Court grants motion to expedite and schedules oral argument for March 2025.', key: false },
        ],
      },
      {
        id: 'env-002',
        example: true,
        name: 'Center for Biological Diversity v. Interior',
        status: 'active',
        court: 'D. Mont.',
        dateFiled: '2025-02-06',
        description: 'Challenge to opening Alaska\'s Arctic National Wildlife Refuge to oil and gas leasing.',
        courts: [
          { name: 'D. Mont.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'ANWR Leasing Directive Signed', description: 'President Trump signs executive order directing Interior to immediately re-open the Arctic National Wildlife Refuge Coastal Plain to oil and gas leasing.', key: true },
          { date: '2025-01-30', type: 'admin-action', title: 'BLM Issues Lease Sale Notice', description: 'Bureau of Land Management publishes notice of a new ANWR lease sale scheduled for April 2025, using an expedited timeline that bypasses standard environmental review.', key: false },
          { date: '2025-02-06', type: 'filed', court: 'D. Mont.', title: 'Complaint Filed', description: 'Center for Biological Diversity and allies file suit arguing the expedited leasing violates NEPA\'s environmental review requirements and the Alaska National Interest Lands Conservation Act.', key: true },
          { date: '2025-02-19', type: 'hearing', court: 'D. Mont.', title: 'Preliminary Injunction Briefing Begins', description: 'Court sets briefing schedule. Plaintiffs file opening brief arguing the lease sale must be enjoined until a full environmental impact statement is completed.', key: false },
        ],
      },
      {
        id: 'env-003',
        example: true,
        name: 'Sierra Club v. Army Corps',
        status: 'active',
        court: '9th Circuit',
        dateFiled: '2025-02-11',
        description: 'Challenge to emergency permitting of pipeline projects bypassing standard environmental review.',
        courts: [
          { name: '9th Circuit', type: 'Court of Appeals', status: 'active' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'National Energy Emergency Declared', description: 'President Trump declares a "national energy emergency," directing agencies to use emergency authorities to expedite permitting for oil and gas pipelines by bypassing standard NEPA review.', key: true },
          { date: '2025-02-03', type: 'admin-action', title: 'Army Corps Issues Emergency Nationwide Permits', description: 'Army Corps of Engineers issues blanket emergency nationwide permits for pipeline construction affecting wetlands and waterways, covering 14 projects across 11 states.', key: true },
          { date: '2025-02-11', type: 'filed', court: '9th Circuit', title: 'Complaint Filed', description: 'Sierra Club and state environmental agencies file suit arguing the blanket emergency permits violate the Clean Water Act, which requires project-specific review for Section 404 permits.', key: true },
          { date: '2025-02-19', type: 'hearing', court: '9th Circuit', title: 'Emergency Motion Filed', description: 'Plaintiffs file emergency motion to stay permits on two projects already under construction in protected wetlands in Louisiana and Michigan.', key: false },
        ],
      },
      {
        id: 'env-004',
        example: true,
        name: 'State of California v. EPA',
        status: 'injunction',
        court: '9th Circuit',
        dateFiled: '2025-01-31',
        description: 'California and 17 other states challenge federal revocation of the state\'s authority to set stricter vehicle emission standards.',
        courts: [
          { name: '9th Circuit', type: 'Court of Appeals', status: 'active' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'California Waiver Revoked', description: 'EPA Administrator signs order revoking California\'s Clean Air Act waiver, which had allowed California and 17 other states to set stricter vehicle emission and zero-emission vehicle standards.', key: true },
          { date: '2025-01-31', type: 'filed', court: '9th Circuit', title: 'Petition Filed', description: 'California and 17 allied states file a petition for review directly in the 9th Circuit, which has jurisdiction over CAA waiver decisions, arguing the revocation is arbitrary and contrary to statute.', key: true },
          { date: '2025-02-05', type: 'tro', court: '9th Circuit', title: 'Administrative Stay Granted', description: '9th Circuit grants an administrative stay blocking the waiver revocation from taking effect while the court considers a motion for a substantive stay.', key: true },
          { date: '2025-02-14', type: 'injunction', court: '9th Circuit', title: 'Stay Pending Review Granted', description: 'Three-judge panel grants a stay pending full merits review, finding petitioners are likely to succeed in showing EPA acted contrary to the Clean Air Act\'s text and history.', key: true },
        ],
      },
    ],
  },

  {
    slug: 'healthcare',
    title: 'Healthcare',
    color: '#e9c46a',
    description:
      'Lawsuits challenging cuts to Medicaid, attempts to repeal or undermine the Affordable Care Act, and restrictions on reproductive healthcare access.',
    stats: [
      { number: 42,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#e9c46a', delay: 0 },
      { number: 28,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 10,  label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 4,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'hc-001',
        example: true,
        name: 'Planned Parenthood v. HHS',
        status: 'injunction',
        court: 'D. Or.',
        dateFiled: '2025-01-24',
        description: 'Challenge to reinstatement of the "gag rule" barring federally funded Title X clinics from referring patients for abortion.',
        courts: [
          { name: 'D. Or.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'Gag Rule Reinstated by Executive Order', description: 'President Trump signs executive order reinstating the Title X "gag rule," barring any clinic receiving federal Title X family planning funds from counseling patients about abortion or providing referrals.', key: true },
          { date: '2025-01-24', type: 'filed', court: 'D. Or.', title: 'Complaint Filed', description: 'Planned Parenthood Federation and Title X clinic networks file suit in D. Or. arguing the rule violates patients\' First Amendment rights and imposes an unconstitutional condition on federal funding.', key: true },
          { date: '2025-01-30', type: 'tro', court: 'D. Or.', title: 'TRO Granted', description: 'Judge grants TRO blocking enforcement of the gag rule, finding that patients\' rights to receive accurate health information are immediately threatened.', key: true },
          { date: '2025-02-11', type: 'injunction', court: 'D. Or.', title: 'Nationwide Preliminary Injunction', description: 'Court issues nationwide preliminary injunction, finding the gag rule is likely unconstitutional as it compels health providers to withhold material information from patients.', key: true },
        ],
      },
      {
        id: 'hc-002',
        example: true,
        name: 'State of Minnesota v. CMS',
        status: 'active',
        court: 'D. Minn.',
        dateFiled: '2025-02-08',
        description: 'Multi-state challenge to proposed Medicaid work requirements that would strip coverage from millions.',
        courts: [
          { name: 'D. Minn.', type: 'District Court', status: 'active' },
          { name: '8th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-24', type: 'admin-action', title: 'CMS Issues Work Requirement Guidance', description: 'Centers for Medicare & Medicaid Services issues guidance inviting states to apply for Section 1115 waivers requiring Medicaid recipients to document work, job training, or community service hours as a condition of eligibility.', key: true },
          { date: '2025-02-01', type: 'admin-action', title: 'CMS Approves First State Waivers', description: 'CMS approves work requirement waivers for Georgia and Arkansas, with more states\' applications fast-tracked for approval, potentially affecting over 4 million beneficiaries.', key: false },
          { date: '2025-02-08', type: 'filed', court: 'D. Minn.', title: 'Multi-State Complaint Filed', description: 'Minnesota, joined by 13 other states, files suit arguing work requirements are not a valid Medicaid waiver objective because Medicaid\'s purpose is healthcare coverage, not workforce development.', key: true },
          { date: '2025-02-17', type: 'hearing', court: 'D. Minn.', title: 'Emergency Hearing Requested', description: 'Plaintiffs request an emergency hearing as CMS accelerates approval timelines. Court sets hearing for late February.', key: false },
        ],
      },
      {
        id: 'hc-003',
        example: true,
        name: 'AARP v. HHS',
        status: 'active',
        court: 'D.D.C.',
        dateFiled: '2025-02-13',
        description: 'Challenge to executive action dismantling the Medicare drug price negotiation program established by the Inflation Reduction Act.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'IRA Drug Negotiation Program Suspended', description: 'President Trump signs executive order directing HHS to suspend the Medicare drug price negotiation program established under the Inflation Reduction Act.', key: true },
          { date: '2025-02-04', type: 'admin-action', title: 'CMS Cancels Negotiation Meetings', description: 'CMS cancels scheduled negotiation meetings with pharmaceutical companies for the next round of Medicare drug price negotiations, affecting 15 high-cost drugs slated for negotiation in 2025.', key: false },
          { date: '2025-02-13', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'AARP and beneficiary advocacy groups file suit arguing the executive order cannot lawfully suspend a congressionally enacted statutory program, violating the Presentment Clause and the Take Care Clause.', key: true },
          { date: '2025-02-20', type: 'hearing', court: 'D.D.C.', title: 'Preliminary Conference', description: 'Court holds preliminary conference and orders government to file a response to plaintiffs\' preliminary injunction motion within 10 days.', key: false },
        ],
      },
    ],
  },

  {
    slug: 'foreign-policy',
    title: 'Foreign Policy / Tariffs',
    color: '#c77dff',
    description:
      'Legal challenges to the imposition of broad emergency tariffs, withdrawal from international agreements, and use of wartime economic powers in peacetime.',
    stats: [
      { number: 30,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#c77dff', delay: 0 },
      { number: 22,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 5,   label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 3,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'fp-001',
        example: true,
        name: 'NFTC v. Trump',
        status: 'active',
        court: 'CIT',
        dateFiled: '2025-02-04',
        description: 'Business groups challenge the legality of sweeping tariffs imposed under the International Emergency Economic Powers Act.',
        courts: [
          { name: 'Court of Intl. Trade', type: 'Specialized Court', status: 'active' },
          { name: 'Federal Circuit', type: 'Court of Appeals', status: 'anticipated' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-20', type: 'admin-action', title: 'National Economic Emergency Declared', description: 'President Trump declares a national economic emergency under IEEPA, invoking it as authority to impose 10–25% tariffs on imports from Canada, Mexico, and China without congressional approval.', key: true },
          { date: '2025-02-01', type: 'admin-action', title: 'Tariffs Take Effect', description: 'Tariffs of 25% on Canadian and Mexican goods and 10% on Chinese goods take effect, representing one of the broadest uses of IEEPA tariff authority in the statute\'s history.', key: true },
          { date: '2025-02-04', type: 'filed', court: 'Court of Intl. Trade', title: 'Complaint Filed at CIT', description: 'National Foreign Trade Council and business coalitions file suit in the Court of International Trade, arguing IEEPA does not authorize tariffs and the President cannot impose taxes without congressional authorization.', key: true },
          { date: '2025-02-17', type: 'hearing', court: 'Court of Intl. Trade', title: 'Oral Argument on Motion to Dismiss', description: 'CIT hears oral argument on whether the court has jurisdiction and whether the political question doctrine bars review of executive tariff decisions.', key: false },
        ],
      },
      {
        id: 'fp-002',
        example: true,
        name: 'State of Oregon v. Trump',
        status: 'active',
        court: '9th Circuit',
        dateFiled: '2025-02-09',
        description: 'Challenge to 25% tariffs on Canadian and Mexican goods, arguing they exceed presidential authority under IEEPA.',
        courts: [
          { name: 'D. Or.', type: 'District Court', status: 'completed' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'active' },
          { name: 'Supreme Court', type: 'Supreme Court', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-02-01', type: 'admin-action', title: 'Tariffs on Canada and Mexico Take Effect', description: '25% tariffs on all Canadian and Mexican goods take effect under presidential proclamation citing the IEEPA national economic emergency declaration.', key: true },
          { date: '2025-02-07', type: 'admin-action', title: 'Retaliatory Tariffs Announced', description: 'Canada and Mexico announce retaliatory tariffs on U.S. agricultural goods and manufactured products, prompting Oregon and other agricultural states to assess economic harm.', key: false },
          { date: '2025-02-09', type: 'filed', court: 'D. Or.', title: 'Complaint Filed', description: 'Oregon, joined by 11 other states with significant trade ties to Canada and Mexico, files suit in D. Or. challenging the tariffs as exceeding IEEPA\'s scope and violating the nondelegation doctrine.', key: true },
          { date: '2025-02-15', type: 'appeal', court: '9th Circuit', title: 'Case Transferred to 9th Circuit', description: 'D. Or. transfers the case to the 9th Circuit on jurisdictional grounds, finding that tariff challenges involving multiple states are better resolved at the circuit level.', key: true },
          { date: '2025-02-20', type: 'hearing', court: '9th Circuit', title: 'Jurisdictional Briefing Ordered', description: 'Court orders supplemental briefing on whether states have standing to challenge federal tariff decisions.', key: false },
        ],
      },
      {
        id: 'fp-003',
        example: true,
        name: 'American Farm Bureau v. USTR',
        status: 'injunction',
        court: 'CIT',
        dateFiled: '2025-02-16',
        description: 'Agricultural producers challenge retaliatory tariffs harming export markets, seeking emergency injunctive relief.',
        courts: [
          { name: 'Court of Intl. Trade', type: 'Specialized Court', status: 'active' },
          { name: 'Federal Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-02-01', type: 'admin-action', title: 'Tariffs Trigger Agricultural Retaliation', description: 'U.S. tariffs on Canada and Mexico trigger retaliatory tariffs by both countries specifically targeting U.S. agricultural exports including soybeans, corn, wheat, and pork.', key: true },
          { date: '2025-02-10', type: 'admin-action', title: 'China Adds Agricultural Retaliatory Tariffs', description: 'China imposes additional retaliatory tariffs on U.S. agricultural exports in response to the 10% IEEPA tariff on Chinese goods, exacerbating losses for American farm operators.', key: false },
          { date: '2025-02-16', type: 'filed', court: 'Court of Intl. Trade', title: 'Complaint and Emergency Motion Filed', description: 'American Farm Bureau Federation files suit in CIT seeking an emergency injunction against the IEEPA tariffs, presenting evidence that farm bankruptcies are already accelerating.', key: true },
          { date: '2025-02-19', type: 'hearing', court: 'Court of Intl. Trade', title: 'Emergency Hearing — TRO Denied', description: 'CIT holds emergency hearing but declines to issue a TRO, finding that economic harm, while significant, does not meet the irreparable harm standard required for emergency injunctive relief.', key: true },
        ],
      },
    ],
  },

  {
    slug: 'free-speech',
    title: 'Free Speech / Press',
    color: '#ff9f43',
    description:
      'Cases involving First Amendment challenges to the revocation of press credentials, retaliatory actions against media organizations, and restrictions on government employee speech.',
    stats: [
      { number: 25,  label: 'Total Cases',           sublabel: 'Filed since Jan 20, 2025',            color: '#ff9f43', delay: 0 },
      { number: 18,  label: 'Active & Ongoing',       sublabel: 'Currently in litigation',             color: '#457b9d', delay: 100 },
      { number: 4,   label: 'Policy Halted',          sublabel: 'Temporary injunction in effect',      color: '#f4a261', delay: 200 },
      { number: 3,   label: 'Closed — Against Admin', sublabel: 'Final ruling against administration', color: '#e63946', delay: 300 },
    ],
    cases: [
      {
        id: 'fs-001',
        example: true,
        name: 'AP v. White House Press Office',
        status: 'active',
        court: 'D.D.C.',
        dateFiled: '2025-02-03',
        description: 'Associated Press challenges revocation of press pool access in retaliation for editorial decisions about naming the Gulf of Mexico.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-21', type: 'admin-action', title: 'AP Removed from Press Pool', description: 'White House Press Office revokes Associated Press\'s press pool credentials and access to Oval Office spray events, citing the AP\'s editorial decision to continue using the name "Gulf of Mexico" rather than "Gulf of America."', key: true },
          { date: '2025-01-31', type: 'admin-action', title: 'AP Access Further Restricted', description: 'AP reporters barred from accompanying the President on Air Force One and from entering White House briefing room for off-camera gaggles.', key: false },
          { date: '2025-02-03', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'Associated Press files suit in D.D.C. alleging the credential revocation constitutes unconstitutional viewpoint-based retaliation against the press, citing Sherrill v. Knight and related precedent on press access rights.', key: true },
          { date: '2025-02-14', type: 'hearing', court: 'D.D.C.', title: 'Oral Argument on Preliminary Injunction', description: 'Court hears arguments on AP\'s motion for a preliminary injunction restoring press pool access, with government arguing that press access is a privilege, not a right.', key: false },
          { date: '2025-02-19', type: 'hearing', court: 'D.D.C.', title: 'Motion Taken Under Advisement', description: 'Judge signals skepticism of government\'s position that credential decisions are unreviewable, takes the preliminary injunction motion under advisement.', key: false },
        ],
      },
      {
        id: 'fs-002',
        example: true,
        name: 'Reporters Committee v. DOJ',
        status: 'injunction',
        court: 'D.D.C.',
        dateFiled: '2025-02-10',
        description: 'Press freedom groups challenge DOJ subpoenas targeting journalists\' sources at major news organizations.',
        courts: [
          { name: 'D.D.C.', type: 'District Court', status: 'active' },
          { name: 'D.C. Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-25', type: 'admin-action', title: 'DOJ Rescinds Journalist Subpoena Protections', description: 'Attorney General rescinds Biden-era DOJ regulations limiting the use of subpoenas, warrants, and court orders to obtain information from or about journalists, restoring a broader investigatory toolkit.', key: true },
          { date: '2025-02-05', type: 'admin-action', title: 'Subpoenas Issued to Three News Orgs', description: 'DOJ issues subpoenas to the New York Times, Washington Post, and CNN seeking phone records and identifying information for sources of classified leak stories.', key: true },
          { date: '2025-02-10', type: 'filed', court: 'D.D.C.', title: 'Complaint Filed', description: 'Reporters Committee for Freedom of the Press files suit challenging the subpoenas as prior restraints and violations of the qualified First Amendment reporter\'s privilege recognized by federal circuit courts.', key: true },
          { date: '2025-02-15', type: 'tro', court: 'D.D.C.', title: 'In Camera Review Ordered — Subpoenas Stayed', description: 'Judge orders in camera review of the classified information underlying the subpoenas before ruling on a TRO, placing the subpoenas on hold during that review period.', key: true },
        ],
      },
      {
        id: 'fs-003',
        example: true,
        name: 'ACLU v. OPM',
        status: 'active',
        court: 'N.D. Cal.',
        dateFiled: '2025-02-07',
        description: 'Challenge to directives barring federal employees from speaking to the press or congressional staff without prior approval.',
        courts: [
          { name: 'N.D. Cal.', type: 'District Court', status: 'active' },
          { name: '9th Circuit', type: 'Court of Appeals', status: 'anticipated' },
        ],
        timeline: [
          { date: '2025-01-22', type: 'admin-action', title: 'OPM Issues Communications Blackout Memo', description: 'OPM issues government-wide memorandum directing all federal employees to route any communications with journalists, Congressional staff, and members of the public through agency communications offices.', key: true },
          { date: '2025-01-29', type: 'admin-action', title: 'Multiple Agencies Issue Implementing Policies', description: 'EPA, USDA, HHS, and DOI each issue agency-specific policies implementing the blackout, in several cases explicitly prohibiting scientists from sharing research data with media without prior clearance.', key: false },
          { date: '2025-02-07', type: 'filed', court: 'N.D. Cal.', title: 'Complaint Filed', description: 'ACLU and Government Accountability Project file suit on behalf of federal employee groups arguing the communications directive violates the First Amendment as a content-based restriction on government employee speech on matters of public concern.', key: true },
          { date: '2025-02-18', type: 'hearing', court: 'N.D. Cal.', title: 'Preliminary Injunction Hearing Scheduled', description: 'Court sets hearing on plaintiffs\' motion for a preliminary injunction against the OPM communications directive.', key: false },
        ],
      },
    ],
  },
]

// "Other" catch-all — cases that don't fit a specific issue
ISSUES.push({
  slug: 'other',
  title: 'Other',
  color: '#64748b',
  description: 'Cases that don\'t fit a specific issue category — including contract disputes, tort claims, trade cases, and other miscellaneous federal litigation.',
  stats: [],
  cases: [],
})

export const ISSUES_BY_SLUG = Object.fromEntries(
  ISSUES.map(issue => [issue.slug, issue])
)

export const CASES_BY_ID = Object.fromEntries(
  ISSUES.flatMap(issue =>
    issue.cases.map(c => [
      c.id,
      { ...c, issueSlug: issue.slug, issueTitle: issue.title, issueColor: issue.color },
    ])
  )
)

export const ALL_CASES = ISSUES.flatMap(issue =>
  issue.cases.map(c => ({
    ...c,
    issueSlug: issue.slug,
    issueTitle: issue.title,
    issueColor: issue.color,
  }))
)
