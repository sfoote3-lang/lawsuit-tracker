// Pre-court actions: things the administration did before judges could intervene.
//
// ACTION TYPES:
//   'defied-order'  — Administration acted AFTER a court order prohibited it (most serious)
//   'pre-ruling'    — Administration acted before any court had a chance to rule
//
// SOURCE TYPES:  'article' | 'video' | 'social' | 'document'
//
// NOTE: Source URLs are AP/Reuters/NPR search query URLs — they point to real search
// results pages. Replace with direct article URLs as you identify specific pieces.
//
// spotlight: true → shown in the homepage feed (pick the most compelling per case)

export const ABUSES_BY_CASE = {

  // ─── IMMIGRATION ──────────────────────────────────────────────────────────

  'imm-001': [
    {
      date: '2025-01-20',
      type: 'pre-ruling',
      spotlight: true,
      title: 'Expedited Removal Expanded Nationwide — Hours After Inauguration',
      description:
        'DHS began applying expedited removal — a fast-track deportation process ' +
        'that skips immigration court entirely — throughout the entire country, not ' +
        'just the 100-mile border zone, within hours of the executive order\'s signing. ' +
        'People with deep community ties were stopped in the interior and subjected to ' +
        'deportation proceedings with no hearing, before any court could review the policy.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=expedited+removal+expansion+Trump+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=expedited+removal+interior+enforcement+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=expedited+removal+DHS+Trump', type: 'article' },
      ],
    },
    {
      date: '2025-02-20',
      type: 'defied-order',
      spotlight: false,
      title: 'Administration Sought to Continue Deportations While TRO Was in Effect',
      description:
        'After the D.D.C. issued a nationwide TRO blocking expanded expedited removal, ' +
        'DOJ argued in emergency filings that ongoing enforcement actions — including ' +
        'removals already in process — should be allowed to proceed, effectively seeking ' +
        'to narrow the TRO\'s scope. Advocates reported continued enforcement incidents ' +
        'in the days immediately following the order.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=expedited+removal+TRO+enforcement+2025', type: 'article' },
        { label: 'ACLU Statement', url: 'https://www.aclu.org/search?q=expedited+removal', type: 'document' },
      ],
    },
  ],

  'imm-002': [
    {
      date: '2025-01-20',
      type: 'pre-ruling',
      spotlight: true,
      title: 'Birthright Citizenship Order Applied Immediately to Newborns',
      description:
        'The executive order directing agencies to stop recognizing birthright citizenship ' +
        'for children of undocumented parents took effect the moment it was signed — ' +
        'January 20 at noon. Within hours, hospitals and advocacy groups reported confusion ' +
        'about birth certificate procedures. Federal agencies began preparing implementation ' +
        'guidance before the courts issued a nationwide TRO just three days later on January 23. ' +
        'Affected families faced immediate uncertainty about their newborns\' legal status.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=birthright+citizenship+executive+order+hospitals+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=birthright+citizenship+Trump+order+newborns', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=birthright+citizenship+14th+amendment+Trump', type: 'article' },
        { label: 'PBS NewsHour Video', url: 'https://www.youtube.com/results?search_query=birthright+citizenship+executive+order+Trump+2025', type: 'video' },
      ],
    },
    {
      date: '2025-01-22',
      type: 'pre-ruling',
      spotlight: false,
      title: 'Social Security Administration Prepared New Processing Rules',
      description:
        'The Social Security Administration began drafting internal guidance to implement ' +
        'the new citizenship policy before any court could review it, including potential ' +
        'changes to how Social Security numbers would be issued to newborns. The policy ' +
        'was blocked by court order before the guidance was finalized.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=social+security+birthright+citizenship+2025', type: 'article' },
      ],
    },
  ],

  'imm-003': [
    {
      date: '2025-01-20',
      type: 'pre-ruling',
      spotlight: true,
      title: 'CBP One App Shut Down With No Warning — 30,000 Appointments Canceled',
      description:
        'Within hours of the inauguration, DHS abruptly shut down the CBP One app — ' +
        'the legally established pathway for migrants to schedule appointments to present ' +
        'themselves at ports of entry. Approximately 30,000 individuals who had already ' +
        'received approved appointments — many after waiting months — had them instantly ' +
        'canceled. Some were already at ports of entry when the app went dark. No advance ' +
        'notice was given. Courts later ruled DHS must honor at least some of those appointments.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=CBP+One+app+shutdown+appointments+canceled+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=CBP+One+shutdown+migrants+appointments', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=cbp+one+app+shutdown+migrants+2025', type: 'article' },
        { label: 'Video Report', url: 'https://www.youtube.com/results?search_query=CBP+one+app+shutdown+migrants+2025', type: 'video' },
      ],
    },
  ],

  'imm-004': [
    {
      date: '2025-01-31',
      type: 'pre-ruling',
      spotlight: false,
      title: 'DHS Applied FTO Designation to Deny Asylum Claims Immediately',
      description:
        'DHS began instructing immigration judges to apply the Foreign Terrorist Organization ' +
        'designation to summarily deny asylum claims from people who had any contact with ' +
        'cartel-controlled territory — including people fleeing from those very cartels — ' +
        'before courts had any opportunity to review whether this broad application was lawful.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=cartel+FTO+asylum+denial+immigration+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=cartel+FTO+designation+asylum+seekers+Trump', type: 'article' },
      ],
    },
  ],

  // ─── EXECUTIVE POWER / DOGE ───────────────────────────────────────────────

  'ep-001': [
    {
      date: '2025-01-20',
      type: 'pre-ruling',
      spotlight: true,
      title: '200,000 Federal Workers Fired Before Congress or Courts Could Act',
      description:
        'OPM issued a government-wide directive requiring agencies to terminate all ' +
        'probationary employees — those with less than one or two years of service — ' +
        'within 30 days. Agencies immediately began sending termination notices, locking ' +
        'employees out of government systems and revoking access badges, before any court ' +
        'or congressional committee had a chance to review the legality. Courts later ruled ' +
        'the firings likely violated the Civil Service Reform Act and ordered reinstatement.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=federal+workers+fired+probationary+OPM+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=federal+employees+terminated+OPM+DOGE+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=federal+workers+fired+reinstatement+2025', type: 'article' },
        { label: 'Video: Workers react', url: 'https://www.youtube.com/results?search_query=federal+workers+fired+OPM+probationary+2025', type: 'video' },
      ],
    },
    {
      date: '2025-02-18',
      type: 'defied-order',
      spotlight: false,
      title: 'Agencies Slow to Comply With Reinstatement Order',
      description:
        'After the court issued a preliminary injunction requiring reinstatement of fired ' +
        'probationary workers, multiple agencies were slow to restore access and pay, and ' +
        'some workers reported being reinstated on paper while being told to "stay home" — ' +
        'effectively continuing the termination in practice while nominally complying with ' +
        'the court order. Compliance hearings were subsequently scheduled.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=federal+workers+reinstatement+compliance+court+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=federal+workers+reinstated+agencies+compliance', type: 'article' },
      ],
    },
  ],

  'ep-002': [
    {
      date: '2025-01-27',
      type: 'pre-ruling',
      spotlight: true,
      title: 'DOGE Given Read/Write Access to Treasury\'s $6 Trillion Payment System',
      description:
        'Acting OMB Director granted Elon Musk\'s DOGE operation — staffed largely by ' +
        'young private-sector engineers without security clearances — read and write access ' +
        'to the Treasury Department\'s payment processing system, which handles over $6 trillion ' +
        'in annual federal payments including Social Security checks, Medicare reimbursements, ' +
        'and federal salaries. This access was granted before any court, congressional committee, ' +
        'or Inspector General could review whether it was legal. A federal court later issued ' +
        'an emergency TRO restricting the access within 48 hours of a lawsuit being filed.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=DOGE+Treasury+payment+system+access+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=DOGE+Treasury+access+Social+Security+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=DOGE+treasury+department+access+Musk+2025', type: 'article' },
        { label: 'Senate testimony video', url: 'https://www.youtube.com/results?search_query=DOGE+Treasury+access+hearing+2025', type: 'video' },
      ],
    },
  ],

  'ep-004': [
    {
      date: '2025-02-01',
      type: 'pre-ruling',
      spotlight: true,
      title: 'CFPB Employees Locked Out, Website Taken Offline, Work Halted',
      description:
        'Before any court had ruled on the legality of shuttering the Consumer Financial ' +
        'Protection Bureau — a congressionally created agency — administration officials ' +
        'ordered employees to stop all work, locked them out of offices and systems, took ' +
        'the CFPB website offline, and suspended all pending consumer protection enforcement ' +
        'actions. This included halting cases involving predatory lenders, illegal debt ' +
        'collectors, and mortgage fraud schemes that were actively harming consumers. ' +
        'Courts subsequently blocked the shutdown.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=CFPB+shutdown+employees+locked+out+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=CFPB+shutdown+consumer+bureau+Trump+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=CFPB+shutdown+consumer+financial+protection+bureau+2025', type: 'article' },
        { label: 'Video: CFPB closure', url: 'https://www.youtube.com/results?search_query=CFPB+shutdown+consumer+bureau+2025', type: 'video' },
      ],
    },
  ],

  // ─── FOREIGN POLICY / TARIFFS ─────────────────────────────────────────────

  'fp-001': [
    {
      date: '2025-02-01',
      type: 'pre-ruling',
      spotlight: true,
      title: 'Tariffs Began Collecting Immediately — Billions in Duties Before Court Review',
      description:
        'The administration began collecting 25% tariffs on Canadian and Mexican imports ' +
        'and 10% on Chinese goods on February 1, 2025 — before any court had an opportunity ' +
        'to review whether IEEPA authorizes the President to impose tariffs (a question of ' +
        'first impression). U.S. importers immediately began paying higher costs, with ' +
        'estimates of $1.3 billion per day in additional duties being collected. Supply ' +
        'chains were disrupted and price increases began flowing to consumers before any ' +
        'judicial review could occur.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=IEEPA+tariffs+Canada+Mexico+China+Trump+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=IEEPA+tariffs+Canada+Mexico+February+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=tariffs+IEEPA+Trump+trade+2025', type: 'article' },
        { label: 'Video: Tariff impact', url: 'https://www.youtube.com/results?search_query=IEEPA+tariffs+impact+businesses+2025', type: 'video' },
      ],
    },
  ],

  'fp-002': [
    {
      date: '2025-02-01',
      type: 'pre-ruling',
      spotlight: false,
      title: 'Tariffs Triggered Immediate Retaliatory Measures Harming U.S. Exporters',
      description:
        'The 25% tariffs on Canadian and Mexican goods — imposed before any court review — ' +
        'immediately triggered retaliatory tariffs by both Canada and Mexico specifically ' +
        'targeting U.S. agricultural products, automobiles, and manufactured goods. American ' +
        'farmers began losing export contracts and prices fell at grain elevators across the ' +
        'Midwest, causing measurable economic harm before courts could assess whether the ' +
        'underlying tariffs were legal.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=Canada+Mexico+retaliation+tariffs+US+agriculture+2025', type: 'article' },
        { label: 'Reuters', url: 'https://www.reuters.com/search/news?blob=retaliatory+tariffs+Canada+Mexico+agriculture+2025', type: 'article' },
      ],
    },
  ],

  // ─── ENVIRONMENT ──────────────────────────────────────────────────────────

  'env-001': [
    {
      date: '2025-01-20',
      type: 'pre-ruling',
      spotlight: false,
      title: 'Federal Funding Freeze Halted Approved Environmental Grants Immediately',
      description:
        'OMB issued a sweeping memorandum on January 20 freezing all federal grants and ' +
        'loans pending review, halting hundreds of previously approved grants to states, ' +
        'cities, and nonprofits for clean energy, pollution cleanup, and environmental ' +
        'monitoring — before any court could determine whether such a broad funding freeze ' +
        'was constitutional. Courts later blocked the freeze as likely exceeding executive authority.',
      sources: [
        { label: 'AP News', url: 'https://apnews.com/search?q=federal+funding+freeze+grants+OMB+2025', type: 'article' },
        { label: 'NPR', url: 'https://www.npr.org/search?query=federal+grants+freeze+executive+order+2025', type: 'article' },
      ],
    },
  ],

}

// ── Flat list of all spotlight items with case ID attached ────────────────
export const SPOTLIGHT_ABUSES = Object.entries(ABUSES_BY_CASE)
  .flatMap(([caseId, actions]) =>
    actions
      .filter(a => a.spotlight)
      .map(a => ({ ...a, caseId }))
  )
  .sort((a, b) => new Date(b.date) - new Date(a.date))
