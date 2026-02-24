// Staff-written case updates and news articles.
// To add a new update: prepend a new object to the UPDATES array.
// Tags should match issue slugs where possible, or use topic tags below.
//
// Available tags: immigration, executive-power, civil-rights, environment,
//   healthcare, education, foreign-policy, free-speech,
//   supreme-court, injunction, ruling, tracker-update

export const UPDATES = [
  {
    id: 'upd-006',
    date: '2025-02-20',
    title: 'Supreme Court Watch: Birthright Citizenship Case Could Set Landmark Precedent',
    author: 'Research Staff',
    tags: ['immigration', 'supreme-court'],
    summary:
      'The administration\'s birthright citizenship executive order — blocked by courts in its first 72 hours — is now on a trajectory toward the Supreme Court. We examine what a SCOTUS ruling could mean for the 14th Amendment and hundreds of pending cases.',
    body: [
      'The executive order signed on Inauguration Day directing federal agencies to stop recognizing birthright citizenship for children of undocumented parents has been blocked in four separate federal courts. Yet the administration continues to press the issue through appeals, raising the prospect of Supreme Court review as early as this term.',

      'The most notable ruling came from Senior U.S. District Judge John Coughenour of the Western District of Washington — a Reagan appointee — who called the order "blatantly unconstitutional" and issued a nationwide temporary restraining order within 72 hours of its signing. "I have been on the bench for over four decades. I can\'t remember another case where the question of constitutionality is so clear," Coughenour said from the bench.',

      'The 14th Amendment, ratified in 1868, states: "All persons born or naturalized in the United States, and subject to the jurisdiction thereof, are citizens of the United States." The administration\'s legal theory rests on a contested reading of the phrase "subject to the jurisdiction thereof" — arguing it excludes children of those who entered the country illegally.',

      'Constitutional scholars across the political spectrum have largely rejected this interpretation. The Supreme Court\'s 1898 decision in United States v. Wong Kim Ark held that the 14th Amendment applies to nearly all persons born on U.S. soil regardless of parents\' immigration status, and that ruling has governed U.S. citizenship law for over 125 years.',

      'The administration\'s appeal to the circuit courts is expected to reach the Supreme Court on an expedited basis. Given the current Court\'s composition and prior statements by some justices on immigration-related questions, the outcome is not certain — making this potentially one of the most consequential constitutional cases of the decade.',
    ],
    relatedCaseIds: ['imm-002'],
  },

  {
    id: 'upd-005',
    date: '2025-02-18',
    title: 'Federal Workers Ordered Reinstated After Mass OPM Terminations',
    author: 'Research Staff',
    tags: ['executive-power'],
    summary:
      'A federal judge in the Northern District of California issued a preliminary injunction requiring agencies to reinstate terminated probationary workers, finding the OPM directive likely exceeded the administration\'s authority under the Civil Service Reform Act.',
    body: [
      'U.S. District Judge William Alsup issued a sweeping preliminary injunction this week requiring federal agencies to reinstate approximately 200,000 probationary workers who were fired following an OPM directive issued on Inauguration Day. The ruling is one of the most significant checks yet on the administration\'s use of executive power to reshape the federal workforce.',

      'Judge Alsup found that the plaintiffs — a coalition of federal employee unions led by the American Federation of Government Employees — were likely to succeed on the merits that Congress, not the President, controls the procedures by which federal employees are hired and fired. The Civil Service Reform Act of 1978 establishes specific procedures for terminating federal workers that the OPM directive did not follow.',

      '"The Civil Service Reform Act exists precisely to prevent this kind of mass political purge of the federal workforce," the court wrote in its order. "OPM cannot, by issuing a memorandum, override what Congress has legislated."',

      'The administration immediately appealed to the Ninth Circuit and sought a stay of the reinstatement order, arguing that the President has inherent authority over executive branch personnel. The stay was denied, and agencies began the process of reinstating workers — though compliance varied significantly across agencies.',

      'Reports emerged in the days following the order that some agencies were reinstating workers on paper while directing them to "stand by at home" rather than return to their duties. Compliance hearings are scheduled, and the court has signaled it will take a strict view of what constitutes genuine compliance.',

      'This case is one of several tracking the administration\'s use of DOGE-driven personnel actions. The underlying legal question — whether and to what extent the President can direct mass firings of career civil servants — has broad implications for the independence of the federal bureaucracy.',
    ],
    relatedCaseIds: ['ep-001'],
  },

  {
    id: 'upd-004',
    date: '2025-02-14',
    title: 'DOGE Treasury Access: What the Court Ordered and What Comes Next',
    author: 'Research Staff',
    tags: ['executive-power'],
    summary:
      'A D.C. federal judge issued an emergency TRO within 48 hours of a lawsuit challenging DOGE\'s access to the Treasury\'s payment processing system. We break down what access was granted, what data was at risk, and the legal questions the case raises.',
    body: [
      'On February 9, U.S. District Judge Colleen Kollar-Kotelly issued an emergency temporary restraining order blocking DOGE personnel from maintaining read/write access to the Treasury Department\'s payment processing system — one of the most consequential tech systems in the federal government, handling over $6 trillion in annual payments.',

      'The Treasury payment system processes disbursements for Social Security, Medicare, Medicaid, federal salaries, tax refunds, and hundreds of other federal programs. Access to the system — particularly write access — could theoretically allow users to redirect, delay, or cancel payments to millions of Americans.',

      'The access was granted by Acting OMB Director Russell Vought on January 27, apparently without approval from Treasury\'s Inspector General, the Office of Personnel Management, or any congressional notification. The engineers granted access were DOGE-affiliated contractors, some of whom lacked standard government security clearances.',

      'The court\'s TRO was based on three independent legal grounds: (1) likely violation of the Privacy Act, which restricts who may access systems containing personal financial information; (2) likely violation of the Federal Reserve Act\'s provisions governing Treasury operations; and (3) likely violation of the Appropriations Clause, as payment system access could enable spending or withholding not authorized by Congress.',

      'The administration has appealed and argued that DOGE\'s access was necessary for a "fiscal audit" of federal payments. The court has so far required that any request for system access be submitted to the court for review — an unusual supervisory posture that signals the judge\'s concern about the potential for harm.',

      'This case raises fundamental questions about FOIA, the Privacy Act, and whether executive branch entities can access sensitive personal data of Americans without statutory authority. The full hearing on a preliminary injunction is pending.',
    ],
    relatedCaseIds: ['ep-002'],
  },

  {
    id: 'upd-003',
    date: '2025-02-10',
    title: 'Tariff Challenges Mount: IEEPA Authority in the Courts',
    author: 'Research Staff',
    tags: ['foreign-policy'],
    summary:
      'Three separate legal challenges have now been filed against the administration\'s tariff regime imposed under the International Emergency Economic Powers Act. The key legal question — whether IEEPA authorizes tariffs at all — is one of first impression.',
    body: [
      'The administration\'s invocation of the International Emergency Economic Powers Act to impose sweeping tariffs on imports from Canada, Mexico, and China has generated a wave of litigation. IEEPA, a 1977 statute designed to give the President broad powers to respond to national security and foreign policy emergencies, has never been used to impose tariffs — making the pending cases a genuinely novel question of statutory interpretation.',

      'Three cases are now before the Court of International Trade — the specialized federal court that handles trade and tariff disputes. The lead case, NFTC v. Trump, was filed by the National Foreign Trade Council and asks the court to declare that IEEPA does not authorize tariffs and to permanently enjoin their collection.',

      'The core legal argument against the tariffs is straightforward: Article I of the Constitution gives Congress the power to lay and collect taxes, duties, and tariffs. Congress may delegate that authority to the executive branch, but such delegations must be clear and specific. IEEPA authorizes the President to "regulate" international commerce in an emergency, but the statute\'s text does not mention tariffs, and its legislative history suggests Congress did not contemplate tariff authority.',

      'The administration\'s response is that "regulate" is broad enough to encompass tariffs, and that multiple courts have historically read executive emergency powers expansively in foreign policy contexts.',

      'The stakes are enormous. If the courts rule that IEEPA does not authorize tariffs, hundreds of billions of dollars in duties already collected may need to be refunded, and the administration would need to seek congressional authorization for future trade measures. If the courts uphold the tariffs, it would represent the broadest expansion of unilateral presidential trade authority in modern history.',

      'Meanwhile, the tariffs are causing measurable economic damage: American Farm Bureau has documented accelerating farm bankruptcies, supply chains are disrupted, and U.S. exporters face retaliatory tariffs from Canada, Mexico, and China. Courts have so far declined emergency TRO requests, finding that the economic harm — while real — does not meet the "irreparable" standard for emergency injunctions.',
    ],
    relatedCaseIds: ['fp-001', 'fp-002', 'fp-003'],
  },

  {
    id: 'upd-002',
    date: '2025-02-03',
    title: 'CBP One Shutdown: 30,000 Canceled Appointments and the Legal Aftermath',
    author: 'Research Staff',
    tags: ['immigration', 'injunction'],
    summary:
      'Within hours of the inauguration, DHS shut down the CBP One app, canceling approximately 30,000 pre-approved appointments for migrants to enter legally at U.S. ports of entry. A California federal court later ordered partial restoration. Here\'s what happened.',
    body: [
      'The CBP One mobile application was created by U.S. Customs and Border Protection to allow migrants — primarily those waiting in Mexico — to schedule appointments to present themselves at ports of entry and seek asylum or other legal status. The app represented a congressionally-endorsed, orderly alternative to irregular border crossings.',

      'At approximately 12:15 PM on January 20 — roughly 15 minutes after the inauguration ceremony concluded — DHS remotely disabled the app. Within hours, tens of thousands of individuals received notifications that their pre-approved appointments had been canceled. Some were already at ports of entry when the app went dark; others had traveled hundreds of miles in anticipation of their scheduled entry.',

      'The Immigrant Legal Resource Center filed suit in the Northern District of California on January 28, arguing that the abrupt cancellation violated the due process rights of people who had received formal government approval to enter at a specific date and time. The government had, in their view, made a binding commitment that was revoked without any process.',

      'On February 10, U.S. District Judge Julie Fishtrom granted a partial injunction, ordering DHS to process individuals who had valid, confirmed CBP One appointments as of January 20, 2025. The ruling was narrower than plaintiffs sought — it did not require DHS to restore the app — but it did require the agency to honor the specific commitments it had already made.',

      'DHS compliance with the order has been incomplete. Attorneys representing affected migrants have filed compliance reports with the court documenting cases where individuals with confirmed appointments were turned away at ports of entry. A compliance hearing is scheduled.',

      'The CBP One case illustrates a pattern seen throughout the first months of the administration: using speed to create facts on the ground before courts can intervene, then litigating to minimize judicial remedies. Even a court order cannot fully restore the position of someone who missed a critical legal window.',
    ],
    relatedCaseIds: ['imm-003'],
  },

  {
    id: 'upd-001',
    date: '2025-01-28',
    title: 'About This Tracker: Methodology and How We Select Cases',
    author: 'Kellogg Institute Research Team',
    tags: ['tracker-update'],
    summary:
      'An introduction to how the Notre Dame Kellogg Institute Legal Tracker works, how cases are selected and categorized, and our commitment to nonpartisan, accurate reporting of federal litigation.',
    body: [
      'This tracker was developed by the Kellogg Institute for International Studies at the University of Notre Dame to provide accurate, nonpartisan documentation of major federal lawsuits filed in response to actions by the second Trump administration.',

      'Case Selection: We track cases that meet at least one of the following criteria: (1) filed in or transferred to a federal district court or court of appeals; (2) challenging an executive order, agency action, policy directive, or statute signed or enforced by the administration since January 20, 2025; (3) determined by our research team to be of significant legal, policy, or public interest. We do not track every administrative law case or routine enforcement action — our focus is on cases with broader constitutional or statutory implications.',

      'Categorization: Cases are assigned to one of eight issue categories based on their primary legal subject matter. Cases that span multiple issues are placed in the category most central to the core legal question. Case status (Active, Injunction, Closed — For, Closed — Against) reflects the current posture of the case and is updated as rulings are issued.',

      'Timeline Events: Timeline events are drawn from publicly available federal court records, PACER, court websites, and reporting from major news organizations. We prioritize primary sources — actual court orders and filings — over secondary reporting. All timeline events should be verifiable through the cited court record.',

      'Judicial Appointee Data: The visualization showing judicial rulings by appointing president\'s party is based on our research team\'s analysis of rulings in the tracked cases. We have made every effort to accurately identify the appointing president for each ruling judge. This data is provided for analytical purposes and should not be treated as a definitive partisan characterization of any individual judge.',

      'Limitations: This tracker is not a legal advice resource and should not be relied upon for legal decisions. The law in this area is changing rapidly. Case statuses may lag behind real-time court developments by 24-48 hours. Numbers and statistics on the home page are estimates updated periodically and may not reflect every pending case in every jurisdiction.',

      'Contact: For corrections, updates, or questions about our methodology, please contact the Kellogg Institute at the University of Notre Dame.',
    ],
    relatedCaseIds: [],
  },
]

export const UPDATE_TAGS = [
  { value: 'immigration',     label: 'Immigration' },
  { value: 'executive-power', label: 'Executive Power' },
  { value: 'civil-rights',    label: 'Civil Rights' },
  { value: 'environment',     label: 'Environment' },
  { value: 'healthcare',      label: 'Healthcare' },
  { value: 'foreign-policy',  label: 'Foreign Policy' },
  { value: 'free-speech',     label: 'Free Speech' },
  { value: 'supreme-court',   label: 'Supreme Court' },
  { value: 'injunction',      label: 'Injunction' },
  { value: 'ruling',          label: 'Ruling' },
  { value: 'tracker-update',  label: 'Tracker Update' },
]
