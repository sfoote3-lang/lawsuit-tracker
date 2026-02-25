// Legal glossary used throughout the Gemini case page.
// shortDef  → 1-2 sentences shown in the hover tooltip
// fullDef   → paragraph shown on the /dictionary page
// examples  → case-specific + general examples
// links     → reputable external references
// aliases   → text strings that should trigger this tooltip

export const LEGAL_TERMS = {
  tro: {
    term: 'Temporary Restraining Order (TRO)',
    shortDef:
      'An emergency court order that immediately halts a party\'s action while the court decides on longer-term relief. It can be issued with little or no advance notice to the opposing party.',
    fullDef:
      'A Temporary Restraining Order (TRO) is an emergency court order that immediately prohibits a party from taking a specific action for a short period — typically up to 14 days under federal rules (FRCP 65). Courts grant TROs when a party demonstrates: (1) a likelihood of success on the merits, (2) a risk of irreparable harm without the order, (3) that the balance of hardships favors the requesting party, and (4) that the order serves the public interest. Unlike preliminary injunctions, TROs can sometimes be granted ex parte — without the opposing party present — when emergency circumstances require it. If the TRO expires or is dissolved, the party must seek a preliminary injunction, which requires a fuller hearing.',
    examples: [
      'In this case, Minnesota obtained a TRO on January 24, 2026, the same day the complaint was filed, requiring federal agents to preserve evidence from the crime scene and allow state investigators access.',
      'A business owner might seek a TRO to stop a former employee from using trade secrets while a breach-of-contract lawsuit is pending.',
    ],
    links: [
      { label: 'Federal Rule of Civil Procedure 65 – Injunctions and TROs', url: 'https://www.law.cornell.edu/rules/frcp/rule_65' },
      { label: 'Cornell LII: Temporary Restraining Order', url: 'https://www.law.cornell.edu/wex/temporary_restraining_order' },
    ],
    aliases: ['TRO'],
  },

  injunction: {
    term: 'Injunction / Injunctive Relief',
    shortDef:
      'A court order compelling a party to do — or stop doing — something. Violating an injunction can result in contempt of court, including fines or imprisonment.',
    fullDef:
      'An injunction is a court order compelling a party to take specific action or refrain from specific conduct. Injunctions are classified by duration: temporary restraining orders (days), preliminary injunctions (lasting until trial), and permanent injunctions (issued as a final judgment). Federal courts may issue injunctions only when monetary damages would be insufficient to remedy the harm — a principle called "irreparable harm." Courts traditionally weigh four factors: likelihood of success on the merits, irreparable harm, balance of hardships, and the public interest. "Injunctive relief" is the broader term for any court-ordered remedy of this type.',
    examples: [
      'A preliminary injunction would have required federal officers to allow Minnesota investigators ongoing access to the crime scene and evidence while the full lawsuit proceeded.',
      'Courts regularly issue injunctions in environmental cases to halt construction that would destroy protected wetlands before a full trial can be held.',
    ],
    links: [
      { label: 'Cornell LII: Injunction', url: 'https://www.law.cornell.edu/wex/injunction' },
      { label: 'FRCP Rule 65 – Injunctions and Restraining Orders', url: 'https://www.law.cornell.edu/rules/frcp/rule_65' },
    ],
    aliases: ['injunction', 'Injunction', 'injunctive relief', 'Injunctive Relief', 'injunctions'],
  },

  'pro-hac-vice': {
    term: 'Pro Hac Vice',
    shortDef:
      'Latin for "for this occasion." Allows an attorney not licensed in a particular court\'s jurisdiction to appear in one specific case there, with the court\'s permission.',
    fullDef:
      '"Pro hac vice" (Latin: "for this occasion") is a procedure allowing an attorney licensed in one jurisdiction to appear in a court where they are not regularly admitted, for the purpose of a single case. The attorney must typically be in good standing in their home jurisdiction and must associate with a local attorney who is admitted to the court. Courts grant pro hac vice admission because parties have a fundamental right to be represented by counsel of their choice. The admission is case-specific and does not make the attorney a member of that court\'s bar.',
    examples: [
      'In this case, DOJ attorney Andrew I. Warden was admitted pro hac vice to represent the federal defendants in the District of Minnesota, a court where he was not regularly admitted to practice.',
      'A prominent national civil rights attorney might be admitted pro hac vice in a local state court to handle a high-profile case they would otherwise be barred from appearing in.',
    ],
    links: [
      { label: 'Cornell LII: Pro Hac Vice', url: 'https://www.law.cornell.edu/wex/pro_hac_vice' },
    ],
    aliases: ['pro hac vice', 'Pro Hac Vice', 'Pro hac vice'],
  },

  'declaratory-judgment': {
    term: 'Declaratory Judgment',
    shortDef:
      'A court ruling that defines the legal rights of parties in a dispute without ordering any action or awarding damages. It clarifies the law as applied to a specific situation.',
    fullDef:
      'A declaratory judgment is a binding court ruling that defines the legal rights and obligations of parties without awarding damages or ordering specific action. Under the Declaratory Judgment Act (28 U.S.C. § 2201), federal courts may issue such judgments when there is an actual, live controversy between the parties. Plaintiffs often seek declaratory judgments alongside injunctive relief — first asking the court to declare that certain conduct is unlawful, then asking the court to order it stopped. A favorable declaratory judgment can resolve legal uncertainty and prevent future disputes.',
    examples: [
      'Minnesota sought a declaratory judgment that the federal government\'s exclusion of state investigators from the crime scene was unconstitutional and unlawfully withheld agency action under the APA.',
      'A company might seek a declaratory judgment that its product does not infringe a competitor\'s patent, rather than waiting to be sued.',
    ],
    links: [
      { label: 'Cornell LII: Declaratory Judgment', url: 'https://www.law.cornell.edu/wex/declaratory_judgment' },
      { label: '28 U.S.C. § 2201 – Declaratory Judgment Act', url: 'https://www.law.cornell.edu/uscode/text/28/2201' },
    ],
    aliases: ['declaratory judgment', 'Declaratory Judgment', 'declaratory relief', 'Declaratory relief'],
  },

  apa: {
    term: 'Administrative Procedure Act (APA)',
    shortDef:
      'The federal law governing how government agencies create rules and make decisions. Courts can overturn agency actions that are "arbitrary, capricious, or contrary to law" under § 706.',
    fullDef:
      'The Administrative Procedure Act (APA), codified at 5 U.S.C. §§ 551–706, is the foundational federal law governing how executive branch agencies develop regulations and how courts review those actions. Under § 706, courts must set aside agency action that is arbitrary, capricious, an abuse of discretion, contrary to constitutional right, in excess of statutory jurisdiction, or without observance of required procedures. The APA also allows courts to compel "agency action unlawfully withheld or unreasonably delayed" (§ 706(1)). The APA is one of the most frequently invoked statutes in challenges to federal government conduct.',
    examples: [
      'Minnesota invoked the APA (5 U.S.C. § 706) to argue that the federal government\'s exclusion of state investigators from the crime scene was arbitrary and capricious agency action without legal basis, and also constituted unlawfully withheld agency action.',
      'Environmental groups regularly use the APA to challenge EPA rules they believe are not supported by sufficient scientific evidence or proper public comment procedures.',
    ],
    links: [
      { label: '5 U.S.C. § 706 – APA Scope of Review', url: 'https://www.law.cornell.edu/uscode/text/5/706' },
      { label: 'Cornell LII: Administrative Procedure Act', url: 'https://www.law.cornell.edu/wex/administrative_procedure_act' },
    ],
    aliases: ['APA', '5 U.S.C. § 706(2)', '5 U.S.C. § 706(1)', '5 U.S.C. § 706'],
  },

  'tenth-amendment': {
    term: 'Tenth Amendment',
    shortDef:
      'The constitutional amendment reserving powers not given to the federal government to the states or the people — the legal foundation of federalism and state sovereignty.',
    fullDef:
      'The Tenth Amendment provides that "the powers not delegated to the United States by the Constitution, nor prohibited by it to the States, are reserved to the States respectively, or to the people." It embodies the principle of federalism — that the federal and state governments share sovereignty, with states retaining significant autonomous power in areas like criminal law enforcement. The Supreme Court has used the Tenth Amendment to invalidate federal laws that "commandeer" state officials into implementing federal programs (Printz v. United States, 1997). States invoke it when arguing that federal action impermissibly encroaches on their sovereign functions.',
    examples: [
      'Minnesota invoked the Tenth Amendment to argue that federal obstruction of a state criminal investigation — into a shooting on Minnesota soil by federal officers — unconstitutionally interfered with the state\'s sovereign authority to enforce its own criminal laws.',
      'In Printz v. United States (1997), the Supreme Court relied on the Tenth Amendment to strike down a federal law requiring state officers to conduct background checks on gun buyers.',
    ],
    links: [
      { label: 'Cornell LII: Tenth Amendment', url: 'https://www.law.cornell.edu/constitution/tenth_amendment' },
      { label: 'National Archives: The Bill of Rights', url: 'https://www.archives.gov/founding-docs/bill-of-rights-transcript' },
      { label: 'Printz v. United States (1997) – Oyez', url: 'https://www.oyez.org/cases/1996/95-1478' },
    ],
    aliases: ['Tenth Amendment', 'tenth amendment', '10th Amendment', 'Federalism', 'federalism'],
  },

  'opinion-and-order': {
    term: 'Opinion and Order',
    shortDef:
      'A written court decision that explains the judge\'s legal reasoning (the "opinion") and states the specific court commands that result from that reasoning (the "order").',
    fullDef:
      'An Opinion and Order is a formal written document that combines a judicial opinion — explaining the legal analysis, applicable law, and reasoning — with an operative order translating those conclusions into binding directives. The opinion section recounts the facts, identifies the legal questions, applies relevant law, and reaches conclusions. The order section then specifies what the parties must or must not do. These documents become part of the permanent public court record and may be cited as legal precedent in future cases. A stand-alone "Order" without a written opinion is less detailed and typically reserved for procedural or uncontested matters.',
    examples: [
      'Judge Tostrud\'s February 2, 2026 Opinion and Order (Dkt. #24) dissolved the TRO, finding plaintiffs failed to demonstrate the required likelihood of success on the merits or irreparable harm, and also granted the defendants\' motion to seal an FBI declaration.',
    ],
    links: [
      { label: 'Federal Judicial Center: How Courts Work', url: 'https://www.fjc.gov/education/overview-federal-courts' },
    ],
    aliases: ['Opinion and Order', 'opinion and order'],
  },

  motion: {
    term: 'Motion',
    shortDef:
      'A formal request to the court asking it to take a specific action — such as granting emergency relief, excluding evidence, or dismissing a case.',
    fullDef:
      'A motion is a procedural request filed with the court asking a judge to make a specific ruling or take a specific action. Motions can be made orally during a hearing or in writing. Written motions typically consist of a notice of motion, a supporting memorandum of law arguing the legal basis, and declarations or exhibits providing factual support. The opposing party has an opportunity to file a written opposition, and the moving party may file a reply. Courts then rule on the papers or schedule a hearing for oral argument.',
    examples: [
      'Minnesota filed a Motion for Temporary Restraining Order on January 24, 2026, asking the court to immediately order federal agents to preserve evidence and allow access to the crime scene.',
      'The federal defendants filed a Motion to Seal asking the court to keep the FBI Declaration confidential and out of the public record.',
    ],
    links: [
      { label: 'Cornell LII: Motion', url: 'https://www.law.cornell.edu/wex/motion' },
    ],
    aliases: ['motion', 'Motion', 'motions'],
  },

  brief: {
    term: 'Legal Brief',
    shortDef:
      'A written document filed by a party that presents legal arguments and authorities to persuade the court to rule in their favor on a specific issue.',
    fullDef:
      'A legal brief (also called a memorandum of law or memorandum of points and authorities) is a written document submitted to a court that sets out a party\'s legal arguments, cites relevant statutes and case law, and applies the law to the facts of the case. Briefs typically include a statement of facts, legal argument sections organized by issue, and a conclusion requesting specific relief. Courts set word count or page limits for briefs. Opposing parties file response briefs contesting the arguments, and the original party may file a reply brief addressing the counter-arguments.',
    examples: [
      'Federal defendants filed a Brief in Opposition on January 26, 2026, arguing that the court lacked authority to interfere with a federal investigation and that plaintiffs had not met the legal requirements for emergency injunctive relief.',
    ],
    links: [
      { label: 'Cornell LII: Brief', url: 'https://www.law.cornell.edu/wex/brief' },
    ],
    aliases: ['brief', 'Brief', 'Brief in Opposition', 'brief in opposition'],
  },

  standing: {
    term: 'Standing',
    shortDef:
      'The legal right to bring a lawsuit. A party must show they suffered a concrete injury, caused by the defendant, that a favorable court ruling can fix.',
    fullDef:
      'Standing is the constitutional requirement that a plaintiff must satisfy to bring a federal lawsuit. Under Article III, courts may only hear actual "cases or controversies," which requires plaintiffs to demonstrate: (1) a concrete and particularized injury-in-fact; (2) a causal connection between the injury and the defendant\'s conduct (causation); and (3) the likelihood that a favorable ruling would redress the injury (redressability). Lack of standing is a threshold jurisdictional issue that courts must address first — a case can be dismissed for lack of standing before the merits are ever considered.',
    examples: [
      'Minnesota\'s agencies had standing as sovereign government entities whose law enforcement authority was directly obstructed by federal action — a concrete, particularized injury to their governmental functions.',
      'A citizen who lives far from a proposed factory and has no connection to the affected area may lack standing to challenge the factory\'s environmental permits.',
    ],
    links: [
      { label: 'Cornell LII: Standing', url: 'https://www.law.cornell.edu/wex/standing' },
    ],
    aliases: ['standing', 'Standing'],
  },

  judgment: {
    term: 'Judgment',
    shortDef:
      'The official, final decision of a court that resolves the disputed issues between the parties, entered separately from the court\'s opinion.',
    fullDef:
      'A judgment is the formal final decision of a court on the merits of a case or a specific phase of litigation. In federal court, judgments are entered separately from the court\'s opinion under FRCP Rule 54 and 58 and trigger deadlines for post-judgment motions and appeals. A judgment is distinct from an "order" in that it formally concludes a phase of the case and is the document from which parties calculate the time to appeal. Entry of judgment on a TRO denial, as in this case, started the 30-day clock for any notice of appeal to the Eighth Circuit.',
    examples: [
      'On February 2, 2026, the Clerk entered a formal Judgment following Judge Tostrud\'s Opinion and Order, officially concluding the emergency injunctive relief phase and triggering appellate deadlines.',
    ],
    links: [
      { label: 'Cornell LII: Judgment', url: 'https://www.law.cornell.edu/wex/judgment' },
      { label: 'FRCP Rule 58 – Entering Judgment', url: 'https://www.law.cornell.edu/rules/frcp/rule_58' },
    ],
    aliases: ['judgment', 'Judgment', 'JUDGMENT'],
  },

  declaration: {
    term: 'Declaration / Sworn Declaration',
    shortDef:
      'A written factual statement signed under penalty of perjury. Used to introduce evidence in court in place of live testimony. Similar to an affidavit but does not require a notary.',
    fullDef:
      'A declaration (or "declaration under penalty of perjury") is a written factual statement that the declarant swears or affirms is true, as authorized by 28 U.S.C. § 1746. Unlike affidavits, declarations do not require notarization — the signed statement itself carries the force of a sworn oath. Courts treat false declarations as perjury. Declarations are commonly attached to motions to introduce evidence and are often accompanied by exhibits — documents or records the declarant relies upon or authenticates. Declarations from government officials can sometimes be filed under seal when they contain sensitive or classified information.',
    examples: [
      'Drew Evans, Superintendent of the Minnesota Bureau of Criminal Apprehension, filed a sworn declaration with exhibits describing how federal officers denied access to the crime scene, providing firsthand factual support for the TRO motion.',
      'The federal defendants submitted declarations from FBI agents and ICE officials opposing the TRO, one of which was filed under seal to protect sensitive investigative information.',
    ],
    links: [
      { label: '28 U.S.C. § 1746 – Declarations Under Penalty of Perjury', url: 'https://www.law.cornell.edu/uscode/text/28/1746' },
      { label: 'Cornell LII: Affidavit', url: 'https://www.law.cornell.edu/wex/affidavit' },
    ],
    aliases: ['declaration', 'Declaration', 'sworn declaration', 'declarations', 'Declarations'],
  },

  dissolution: {
    term: 'Dissolution (of an Order)',
    shortDef:
      'When a court formally cancels or "dissolves" a prior order — such as a TRO — it is no longer in force and the parties are no longer bound by it.',
    fullDef:
      'Dissolution is the formal court action that terminates a previously issued court order. A court may dissolve a TRO or injunction when the requesting party fails to meet the legal standard for continued relief, when circumstances change, or after a hearing where the opposing party demonstrates the order should not continue. Once dissolved, the order has no legal force. In this case, the dissolution of the TRO meant federal agencies were no longer required to allow Minnesota investigators access to evidence — restoring the pre-TRO status quo.',
    examples: [
      'Judge Tostrud dissolved the January 24, 2026 TRO on February 2, 2026, finding the plaintiffs had not demonstrated the required likelihood of success on the merits of their constitutional claims.',
    ],
    links: [
      { label: 'Cornell LII: Injunction — Dissolution', url: 'https://www.law.cornell.edu/wex/injunction' },
    ],
    aliases: ['dissolved', 'dissolves', 'dissolution', 'Dissolved', 'DISSOLVED'],
  },

  'oral-arguments': {
    term: 'Oral Arguments',
    shortDef:
      'A scheduled court hearing where attorneys for each side verbally present their legal arguments to the judge and answer the judge\'s questions.',
    fullDef:
      'Oral arguments are formal court proceedings in which attorneys for each party present spoken arguments to a judge or panel of judges and respond to questions from the bench. Unlike trials, oral arguments focus on legal questions rather than factual disputes. In district court, oral arguments on motions are discretionary — judges may decide motions solely on the written briefs or may schedule a hearing. Oral arguments allow judges to probe weaknesses in legal theories and clarify ambiguous points. The judge may take the matter "under advisement" after oral arguments, meaning they will issue a written ruling later.',
    examples: [
      'Judge Tostrud held a 59-minute oral argument hearing on January 26, 2026, where both parties presented arguments on the TRO motion before the judge took it under advisement.',
    ],
    links: [
      { label: 'Federal Judicial Center: Oral Argument', url: 'https://www.fjc.gov/education/overview-federal-courts' },
    ],
    aliases: ['oral arguments', 'Oral Arguments', 'Oral arguments', 'oral argument'],
  },

  'without-prejudice': {
    term: 'Without Prejudice',
    shortDef:
      'A court ruling "without prejudice" means the losing party can raise the same claim again in the future — typically after circumstances change or with a stronger legal showing.',
    fullDef:
      'When a court dismisses or denies a claim "without prejudice," the ruling does not prevent the party from re-filing or re-raising the same claim in the future. This is in contrast to a dismissal or denial "with prejudice," which permanently bars the same claim. Courts deny motions without prejudice when, for example, the plaintiff has not yet developed a sufficient factual record, the scope of the requested relief is overbroad, or circumstances might change. A denial without prejudice is procedurally significant: it signals the door is not fully closed, while still resolving the immediate dispute.',
    examples: [
      'Judge Tostrud denied plaintiffs\' request for further emergency relief "without prejudice," explicitly leaving open the possibility of a future emergency motion if circumstances changed or narrower relief could be justified.',
    ],
    links: [
      { label: 'Cornell LII: Without Prejudice', url: 'https://www.law.cornell.edu/wex/without_prejudice' },
    ],
    aliases: ['without prejudice', 'Without prejudice', 'without prejudice'],
  },
}

// A flat array of { regex, key } pairs for the text annotator
export const TERM_PATTERNS = Object.entries(LEGAL_TERMS).flatMap(([key, { aliases }]) =>
  aliases.map(alias => ({
    regex: new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
    key,
  }))
)
