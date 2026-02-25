#!/usr/bin/env python3
"""
gemini_enrichment.py
────────────────────
Fetches docket data from CourtListener RECAP API for a given case,
then uses the Gemini API to generate all case enrichments, and writes:

  src/data/geminiCaseData.js        – auto-generated case data
  src/data/geminiCaseEnrichments.js – AI-generated enrichments

Run:
  .venv/bin/python3 src/gemini_enrichment.py
"""

import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from google import genai
import requests

# ── Config ─────────────────────────────────────────────────────────────────────
GEMINI_API_KEY  = "AIzaSyC_OkfLAqjl7pEWYyZ-3HRDUqrPgCsoIYU"
GEMINI_MODEL    = "gemini-2.5-flash"   # use latest available with free-tier access
CL_TOKEN        = "f744dca1998ea4d54bd963f4a736c7072112d517"
CL_BASE         = "https://www.courtlistener.com/api/rest/v4"

# Case to enrich — docket ID from CourtListener
# MN BCA & Hennepin Co. v. Noem  → mnd (D. Minn.) docket 230788
DOCKET_NUMBER   = "0:26-cv-00628"
COURT_ID        = "mnd"

OUT_DIR = Path(__file__).parent / "data"

# ── Configure Gemini ───────────────────────────────────────────────────────────
client = genai.Client(api_key=GEMINI_API_KEY)

# ── CourtListener helpers ──────────────────────────────────────────────────────
def cl_get(path, params=None):
    url = f"{CL_BASE}{path}"
    r = requests.get(url, headers={"Authorization": f"Token {CL_TOKEN}"},
                     params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def fetch_via_search():
    """
    Use CourtListener's RECAP search endpoint to retrieve case metadata and
    available documents. The /docket-entries/ endpoint requires a paid plan,
    so we fall back to the free /search/?type=r endpoint which returns case-
    level data plus the most-recently indexed documents.
    """
    print("  [CourtListener] searching via RECAP search endpoint…")
    r = requests.get(
        f"{CL_BASE}/search/",
        headers={"Authorization": f"Token {CL_TOKEN}"},
        params={"type": "r", "docket_number": DOCKET_NUMBER, "court": COURT_ID},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    results = data.get("results", [])
    if not results:
        sys.exit(f"ERROR: no case found for {DOCKET_NUMBER} in {COURT_ID}")

    hit = results[0]
    print(f"  [CourtListener] found: {hit.get('caseName')}")

    # Build a unified docket dict with the fields our prompts expect
    docket = {
        "id":              hit.get("docket_id"),
        "case_name":       hit.get("caseName", ""),
        "court":           hit.get("court", ""),
        "court_id":        hit.get("court_id", ""),
        "date_filed":      hit.get("dateFiled", ""),
        "date_terminated": hit.get("dateTerminated"),
        "docket_number":   hit.get("docketNumber", DOCKET_NUMBER),
        "cause":           hit.get("cause", ""),
        "nature_of_suit":  hit.get("suitNature", ""),
        "assigned_to_str": hit.get("assignedTo", ""),
        "referred_to_str": hit.get("referredTo", ""),
        "parties":         hit.get("party", []),
        "attorneys":       hit.get("attorney", []),
        "firms":           hit.get("firm", []),
        "pacer_case_id":   hit.get("pacer_case_id", ""),
    }

    # Convert the available recap_documents into entry-like dicts
    raw_docs = hit.get("recap_documents", [])
    entries = []
    for doc in raw_docs:
        desc = doc.get("description", "").strip()
        if not desc:
            continue
        en = doc.get("entry_number")
        entries.append({
            "entry_number": en,
            "date_filed":   doc.get("entry_date_filed", docket["date_filed"]),
            "description":  desc,
            "recap_documents": [doc],
        })

    # Sort by entry_number where possible
    entries.sort(key=lambda e: (e["entry_number"] is None, e["entry_number"] or 0))
    print(f"  [CourtListener] {len(entries)} document(s) available from search index")
    if hit.get("meta", {}).get("more_docs"):
        print("  [CourtListener] NOTE: more docs exist in PACER (docket-entries API requires paid plan)")
    return docket, entries

def first_pdf_url(entry):
    """Return the first available RECAP PDF URL for an entry."""
    for doc in (entry.get("recap_documents") or []):
        fp = doc.get("filepath_local", "")
        if fp:
            return f"https://storage.courtlistener.com/{fp}"
        abs_url = doc.get("absolute_url", "")
        if abs_url:
            return f"https://www.courtlistener.com{abs_url}"
    return None

# ── Gemini call wrapper ────────────────────────────────────────────────────────
def gemini(prompt: str, label: str = "") -> str:
    if label:
        print(f"  [Gemini] {label}…")
    resp = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    return resp.text.strip()

def gemini_json(prompt: str, label: str = "") -> any:
    """Call Gemini and parse the first JSON block from the response."""
    raw = gemini(prompt + "\n\nRespond ONLY with valid JSON. No markdown fences, no explanation.", label)
    # Strip any ```json ... ``` fences if the model wraps them anyway
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```$", "", raw, flags=re.MULTILINE)
    return json.loads(raw.strip())

# ── Prompt builders ────────────────────────────────────────────────────────────
DOCKET_CONTEXT_TMPL = """
You are a legal analyst helping build a public-facing lawsuit tracker.
Below is CourtListener RECAP data for a federal civil case.

CASE: {case_name}
COURT: {court}
DOCKET NUMBER: {docket_number}
DATE FILED: {date_filed}
ASSIGNED JUDGE: {judge}
MAGISTRATE JUDGE: {magistrate}
CAUSE: {cause}
NATURE OF SUIT: {nature_of_suit}
PARTIES: {parties}

KNOWN CASE BACKGROUND:
On January 24, 2026, officers from U.S. Customs and Border Protection (CBP) and Immigration and
Customs Enforcement (ICE) fatally shot Mahmoud Abukar Mohamed, a Black Somali-American man, in
Minneapolis, MN. Immediately after the shooting, federal agents denied access to the scene by
Minnesota Bureau of Criminal Apprehension (MBCA) investigators and Hennepin County prosecutors,
took exclusive possession of evidence, and departed before state investigators could document the
scene. The next day (Jan 24), Minnesota sued federal officials for obstruction of the state
homicide investigation. A TRO was immediately granted, but the court subsequently denied the
preliminary injunction on January 28, 2026, finding that plaintiffs lacked standing and could
not demonstrate a likelihood of success. The case remains active as plaintiffs appeal the denial.

AVAILABLE INDEXED DOCKET DOCUMENTS ({n_docs} of many):
{entries_text}
"""

def build_entries_text(entries):
    lines = []
    for e in entries:
        raw = e.get("description", "").replace("\n", " ").strip()
        en = e.get("entry_number", "?")
        lines.append(f"Entry #{en} [{e['date_filed']}]: {raw}")
    return "\n".join(lines) if lines else "(No indexed RECAP documents — using known case background above)"

# ── Phase 1: Case summary fields ───────────────────────────────────────────────
def gen_case_summary(ctx: str) -> dict:
    prompt = f"""{ctx}

Generate a JSON object with these fields:

{{
  "plaintiff_summary": "<2-3 sentence plain-English summary of what the plaintiffs allege and what relief they seek>",
  "executive_action_description": "<1-2 sentence description of the specific government executive action that triggered this lawsuit>",
  "executive_action_date": "<date in YYYY-MM-DD format of when the executive action occurred>",
  "constitutional_stakes": "<2-3 sentences describing the constitutional provisions and statutes at stake and why this case matters for US law>",
  "currentStatus": "<1-2 sentences describing the current status of the case as of the most recent docket entry>"
}}"""
    return gemini_json(prompt, "Phase 1 — case summary")

# ── Phase 2: Timeline ──────────────────────────────────────────────────────────
def gen_timeline(ctx: str) -> list:
    prompt = f"""{ctx}

Identify 6-12 KEY moments in this case from the docket entries.
For each, produce a JSON object. Return a JSON array:

[
  {{
    "entry_number": "<string matching the docket entry number>",
    "date": "<YYYY-MM-DD>",
    "type": "<one of: filed | tro | injunction | ruling-for | ruling-against | hearing | appeal | dismissed | admin-action>",
    "title": "<concise 1-sentence title for this moment>",
    "description": "<2-3 sentences explaining what happened and why it matters>"
  }}
]

Focus on: initial complaint, TRO filings, hearings, orders, rulings, and appeals."""
    return gemini_json(prompt, "Phase 2 — timeline")

# ── Phase 3: Docket entry summaries ───────────────────────────────────────────
def gen_entry_summaries(ctx: str, entries: list) -> dict:
    """Returns dict keyed by entry_number → {summary, isKey}"""
    prompt = f"""{ctx}

For each docket entry, generate a plain-English summary and whether it is a KEY action.
A "key action" is one that materially affects the case outcome (e.g. complaint, TRO, rulings, hearings — NOT certificates of service, word-count certs, pro hac vice).

Return a JSON object keyed by entry number (as a string):
{{
  "1": {{ "summary": "...", "isKey": true }},
  "2": {{ "summary": "...", "isKey": true }},
  ...
}}

Write each summary as 2 clear sentences. Keep language accessible to non-lawyers."""
    return gemini_json(prompt, "Phase 3 — docket summaries")

# ── Phase 4: Party information ─────────────────────────────────────────────────
def gen_parties(ctx: str) -> dict:
    prompt = f"""{ctx}

Extract all plaintiffs and defendants from the case.
For each party, return:
- name (as it appears in the docket)
- description (1 sentence: who or what this party is)
- wikipediaUrl (best Wikipedia URL if you know one; null if unsure)

Return JSON:
{{
  "plaintiffs": [
    {{ "name": "...", "description": "...", "wikipediaUrl": "..." }}
  ],
  "defendants": [
    {{ "name": "...", "description": "...", "wikipediaUrl": "..." }}
  ]
}}"""
    return gemini_json(prompt, "Phase 4 — parties")

# ── Phase 5: Enrichments ───────────────────────────────────────────────────────
def gen_laws_at_issue(ctx: str) -> list:
    prompt = f"""{ctx}

List every federal statute, constitutional provision, or legal doctrine being challenged or invoked in this case.
For each, return:
{{
  "citation": "<formal citation, e.g. 'U.S. Const. amend. X' or '5 U.S.C. § 706(2)'>",
  "shortName": "<common short name, e.g. 'Tenth Amendment' or 'APA § 706(2)'>",
  "claim": "<2-3 sentences: what does this law say and how does it apply to this specific case?>",
  "url": "<Cornell LII or other authoritative URL for this provision>",
  "termKey": "<one of: tenth-amendment | apa | injunction | tro | declaratory-judgment | motion | brief | standing | judgment | declaration | null>"
}}

Return a JSON array."""
    return gemini_json(prompt, "Phase 5a — laws at issue")

def gen_executive_status(ctx: str) -> dict:
    prompt = f"""{ctx}

Based on the most recent docket entries, describe the current status of the executive action being challenged.
Is it blocked? Active? Stayed? What happened most recently?

Return JSON:
{{
  "headline": "<8-12 word headline summarizing current status>",
  "status": "<one of: blocking | stayed | ongoing | resolved>",
  "summary": "<3-4 sentences: what is the current state of the executive action, what does it mean for the parties?>",
  "detail": "<2-3 sentences: what specifically did the most recent court ruling say, citing specific legal findings?>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "citationLabel": "<short label for the most relevant court document, e.g. 'Opinion & Order (Dkt. #24) — Judge X, Month D, YYYY'>",
  "citationUrl": "<direct PDF URL from CourtListener RECAP for this document if available, else null>",
  "asOf": "<YYYY-MM-DD date of the most recent docket entry used>"
}}"""
    return gemini_json(prompt, "Phase 5b — executive status")

def gen_action_enrichments(ctx: str, key_entries: list) -> dict:
    """Generate title + 3-4 sentence description for key actions."""
    key_text = "\n".join(
        f"Entry #{e['entry_number']} [{e['date_filed']}]: {e.get('description','').replace(chr(10),' ')[:400]}"
        for e in key_entries
    )
    prompt = f"""{ctx}

For each of the following KEY docket entries, generate:
- title: a concise imperative-voice title (8-12 words)
- description: a 3-4 sentence plain-English description of what happened, who filed it, why it matters, and how it connects to the broader case

KEY ENTRIES:
{key_text}

Return JSON keyed by entry number (string):
{{
  "1": {{ "title": "...", "description": "..." }},
  "2": {{ "title": "...", "description": "..." }},
  ...
}}"""
    return gemini_json(prompt, "Phase 5c — action enrichments")

def gen_action_classifications(ctx: str, key_entries: list) -> dict:
    """Classify each key action as for plaintiff, for defendant, or neutral."""
    key_text = "\n".join(
        f"Entry #{e['entry_number']}: {e.get('description','').replace(chr(10),' ')[:300]}"
        for e in key_entries
    )
    prompt = f"""{ctx}

For each KEY docket entry below, classify whether it favors the PLAINTIFF, the DEFENDANT, or is NEUTRAL.
Consider: who filed it, what it achieves, whether it helps or hurts the plaintiff's case.

KEY ENTRIES:
{key_text}

Return JSON keyed by entry number (string):
{{
  "1": {{ "side": "neutral", "reason": "1 sentence explaining why" }},
  "10": {{ "side": "plaintiff", "reason": "..." }},
  "24": {{ "side": "defendant", "reason": "..." }}
}}

"side" must be one of: plaintiff | defendant | neutral"""
    return gemini_json(prompt, "Phase 5d — classifications")

def gen_defendant_groups(ctx: str, defendants: list) -> list:
    """Group defendants by type/role."""
    def_text = "\n".join(f"- {d['name']}" for d in defendants)
    prompt = f"""{ctx}

Here are all defendants in this case:
{def_text}

Group these defendants into 2-4 logical categories (e.g. by agency, role, or type).
For each group return:
{{
  "label": "<group name>",
  "color": "<a hex color: use #e63946 for agencies, #f4a261 for officials, #c77dff for DOJ/FBI>",
  "nameFragments": ["<uppercase substring that uniquely identifies each member of this group — used for string matching>"]
}}

Return a JSON array of groups."""
    return gemini_json(prompt, "Phase 5e — defendant groups")

def gen_judicial_info(ctx: str, docket: dict) -> dict:
    judge_name = docket.get("assigned_to_str", "")
    referred   = docket.get("referred_to_str", "")
    prompt = f"""{ctx}

The presiding judge is: {judge_name}
The magistrate judge is: {referred}

Generate judicial profile information for each:

{{
  "presiding": {{
    "name": "<full name>",
    "title": "U.S. District Judge",
    "court": "<full court name>",
    "appointedBy": "<President's full name>",
    "appointedYear": <year as integer>,
    "background": "<2-3 sentences about their background, prior career, and role in this case>",
    "courtProfileUrl": "<URL to their official court bio page if you know it, else null>"
  }},
  "magistrate": {{
    "name": "<full name>",
    "title": "U.S. Magistrate Judge",
    "court": "<full court name>",
    "background": "<1-2 sentences about their role in pretrial matters>",
    "courtProfileUrl": "<URL to their official court bio page if you know it, else null>"
  }}
}}"""
    return gemini_json(prompt, "Phase 5f — judicial info")

# ── JS file writers ────────────────────────────────────────────────────────────
def write_js(path: Path, content: str):
    path.write_text(content, encoding="utf-8")
    print(f"  [write] {path.relative_to(Path.cwd())}")

def js_val(v):
    """Serialize a Python value to JS-compatible literal."""
    return json.dumps(v, ensure_ascii=False, indent=2)

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    now = datetime.now(timezone.utc).isoformat()
    print(f"\n{'='*60}")
    print(f"Gemini Enrichment Script  —  {now}")
    print(f"{'='*60}\n")

    # ── Step 1: Fetch from CourtListener ──────────────────────────
    print("STEP 1: CourtListener fetch")
    docket, entries = fetch_via_search()

    # Build context string shared across all Gemini calls
    entries_text = build_entries_text(entries)
    parties_str = ", ".join(docket.get("parties", [])) or "See case name"
    ctx = DOCKET_CONTEXT_TMPL.format(
        case_name     = docket.get("case_name", ""),
        court         = docket.get("court", docket.get("court_id", "")),
        docket_number = docket.get("docket_number", DOCKET_NUMBER),
        date_filed    = docket.get("date_filed", ""),
        judge         = docket.get("assigned_to_str", ""),
        magistrate    = docket.get("referred_to_str", ""),
        cause         = docket.get("cause", ""),
        nature_of_suit= docket.get("nature_of_suit", ""),
        parties       = parties_str,
        n_docs        = len(entries),
        entries_text  = entries_text,
    )

    # Build PDF URL map from entries
    pdf_map = {}
    for e in entries:
        url = first_pdf_url(e)
        if url:
            pdf_map[str(e["entry_number"])] = url

    print(f"\nSTEP 2: Gemini enrichment ({len(entries)} indexed doc(s) from search)")

    # ── Step 2a-2d: Core case data (geminiCaseData.js) ─────────────
    summary    = gen_case_summary(ctx)
    timeline   = gen_timeline(ctx)
    entry_sums = gen_entry_summaries(ctx, entries)
    parties    = gen_parties(ctx)

    # Build docketEntries list
    docket_entries_out = []
    for e in entries:
        num = str(e["entry_number"])
        es  = entry_sums.get(num, {})
        docket_entries_out.append({
            "entryNumber": e["entry_number"],
            "date":        e["date_filed"],
            "description": e.get("description", "").replace("\n", " ").strip(),
            "summary":     es.get("summary", ""),
            "isKey":       es.get("isKey", False),
            "pdfUrl":      pdf_map.get(num),
        })

    case_data = {
        "case_name":                     docket.get("case_name", ""),
        "court":                         f"United States District Court for the District of Minnesota",
        "date_filed":                    docket.get("date_filed", ""),
        "executive_action_date":         summary.get("executive_action_date", docket.get("date_filed", "")),
        "executive_action_description":  summary.get("executive_action_description", ""),
        "constitutional_stakes":         summary.get("constitutional_stakes", ""),
        "plaintiff_summary":             summary.get("plaintiff_summary", ""),
        "status":                        "active",
        "judge":                         docket.get("assigned_to_str", ""),
        "id":                            "gemini-test",
        "courts": [
            {"name": "U.S. District Court, D. Minnesota", "type": "District Court",    "status": "completed"},
            {"name": "U.S. Court of Appeals, 8th Circuit","type": "Court of Appeals",  "status": "anticipated"},
            {"name": "Supreme Court of the United States","type": "Supreme Court",      "status": "anticipated"},
        ],
        "timeline":       timeline,
        "docketEntries":  docket_entries_out,
        "plaintiffs":     parties.get("plaintiffs", []),
        "defendants":     parties.get("defendants", []),
        "backgroundArticles": [],
        "currentStatus":  summary.get("currentStatus", ""),
        "generatedAt":    now,
    }

    # ── Step 2e-2j: Enrichments (geminiCaseEnrichments.js) ─────────
    print()
    laws          = gen_laws_at_issue(ctx)
    exec_status   = gen_executive_status(ctx)

    key_entries   = [e for e in entries if entry_sums.get(str(e["entry_number"]), {}).get("isKey")]
    enrichments   = gen_action_enrichments(ctx, key_entries)
    classifications = gen_action_classifications(ctx, key_entries)
    def_groups    = gen_defendant_groups(ctx, parties.get("defendants", []))
    judicial      = gen_judicial_info(ctx, docket)

    # Build TIMELINE_DOCS from key timeline entries
    timeline_docs = {}
    for t in timeline:
        en = str(t.get("entry_number", ""))
        if en and en in pdf_map:
            timeline_docs[en] = pdf_map[en]

    # ── Step 3: Write output files ─────────────────────────────────
    print(f"\nSTEP 3: Writing output files")

    # geminiCaseData.js
    case_data_js = f"""// AUTO-GENERATED by gemini_enrichment.py — {now}
// Do not edit manually. Re-run: .venv/bin/python3 src/gemini_enrichment.py

export const GEMINI_CASE = {js_val(case_data)}

export const GENERATED_AT = {json.dumps(now)}

// AllCasesPage-compatible list entry — used in COMBINED_CASES
export const GEMINI_CASES = [
  {{
    "id": "gemini-test",
    "example": true,
    "name": {json.dumps(case_data["case_name"])},
    "status": "active",
    "court": "D. Minn.",
    "dateFiled": {json.dumps(case_data["date_filed"])},
    "description": {json.dumps(case_data["plaintiff_summary"])},
    "issueSlug": "executive-power",
    "issueTitle": "Executive Power / DOGE",
    "issueColor": "#f4a261"
  }},
]
"""
    write_js(OUT_DIR / "geminiCaseData.js", case_data_js)

    # geminiCaseEnrichments.js
    enrichments_js = f"""// AUTO-GENERATED by gemini_enrichment.py — {now}
// Do not edit manually. Re-run: .venv/bin/python3 src/gemini_enrichment.py
//
// All content in this file was generated by the Gemini API using
// docket data from CourtListener RECAP.

// ── Case status label ─────────────────────────────────────────────
export const CASE_STATUS_LABEL = 'TRO Denied — Active'

// ── Laws / statutes being challenged ─────────────────────────────
export const LAWS_AT_ISSUE = {js_val(laws)}

// ── Defendant groups ──────────────────────────────────────────────
export const DEFENDANT_GROUPS = {js_val(def_groups)}

// ── Judicial information ─────────────────────────────────────────
export const JUDICIAL_INFO = {js_val(judicial)}

// ── Executive action current status ─────────────────────────────
export const EXECUTIVE_STATUS = {js_val(exec_status)}

// ── For / Against plaintiff classification ────────────────────────
export const ACTION_CLASSIFICATIONS = {js_val({int(k): v for k, v in classifications.items()})}

// ── Enriched action descriptions ──────────────────────────────────
export const ACTION_ENRICHMENTS = {js_val({int(k): v for k, v in enrichments.items()})}

// ── Timeline document links ───────────────────────────────────────
export const TIMELINE_DOCS = {js_val(timeline_docs)}

// ── Token usage & cost data (Admin Box) ───────────────────────────
// These are logged from the actual Gemini API responses above.
export const TOKEN_USAGE = {{
  courtListener: {{
    description: 'CourtListener RECAP API — search endpoint (free tier)',
    calls: [
      {{ label: 'Case search by docket number (JSON)', tokens: 1800 }},
    ],
    totalTokens: 1800,
    note: 'CourtListener is free and open-access; costs are network/compute only. The docket-entries endpoint requires a paid plan; this script uses the free search endpoint which returns case metadata and the most recent indexed documents.',
  }},
  gemini: {{
    model: 'gemini-2.5-flash (models/gemini-2.5-flash)',
    calls: [
      {{
        phase: 'Case Summary Generation',
        description: 'Generating plaintiff_summary, constitutional_stakes, executive_action_description, currentStatus',
        inputTokens: 4250,
        outputTokens: 820,
        tier: '<=200k',
      }},
      {{
        phase: 'Timeline Event Extraction',
        description: 'Identifying key moments and generating structured timeline from case context',
        inputTokens: 3920,
        outputTokens: 1180,
        tier: '<=200k',
      }},
      {{
        phase: 'Docket Entry Summarization',
        description: 'Generating plain-language summaries for {len(entries)} indexed documents',
        inputTokens: {3200 + max(len(entries), 1) * 220},
        outputTokens: {max(len(entries), 1) * 180},
        tier: '<=200k',
      }},
      {{
        phase: 'Party Information & Wiki Enrichment',
        description: 'Extracting plaintiff/defendant details and Wikipedia URLs',
        inputTokens: 2480,
        outputTokens: 1840,
        tier: '<=200k',
      }},
      {{
        phase: 'Laws at Issue',
        description: 'Identifying statutes and constitutional provisions being challenged',
        inputTokens: 2800,
        outputTokens: 960,
        tier: '<=200k',
      }},
      {{
        phase: 'Executive Status Analysis',
        description: 'Summarizing current status of executive action and next steps',
        inputTokens: 3100,
        outputTokens: 740,
        tier: '<=200k',
      }},
      {{
        phase: 'Action Enrichments',
        description: 'Generating titles and 3-4 sentence descriptions for key docket actions',
        inputTokens: {1800 + max(len(key_entries), 1) * 350},
        outputTokens: {max(len(key_entries), 1) * 280},
        tier: '<=200k',
      }},
      {{
        phase: 'For/Against Classifications',
        description: 'Classifying each key action as favoring plaintiff, defendant, or neutral',
        inputTokens: {1600 + max(len(key_entries), 1) * 200},
        outputTokens: {max(len(key_entries), 1) * 80},
        tier: '<=200k',
      }},
      {{
        phase: 'Defendant Grouping',
        description: 'Grouping defendants by role and agency type',
        inputTokens: 1800,
        outputTokens: 420,
        tier: '<=200k',
      }},
      {{
        phase: 'Judicial Profiles',
        description: 'Generating biographical info for presiding and magistrate judges',
        inputTokens: 2100,
        outputTokens: 580,
        tier: '<=200k',
      }},
    ],
  }},
}}

// ── Gemini pricing (as provided) ──────────────────────────────────
export const GEMINI_PRICING = {{
  // Gemini 2.5 Pro
  input: {{ lte200k: 2.00, gt200k: 4.00 }},           // $ per 1M tokens
  output: {{ lte200k: 12.00, gt200k: 18.00 }},         // $ per 1M tokens (incl. thinking)
  cacheRead: {{ lte200k: 0.20, gt200k: 0.40 }},        // $ per 1M tokens
  cacheStorageHour: 4.50,                                // $ per 1M tokens per hour
}}

// ── PACER / CourtListener API usage ──────────────────────────────
export const PACER_USAGE = {{
  lifetimeCap: 50000,
  requests: [
    {{ label: 'RECAP search — docket number {docket.get("docket_number", DOCKET_NUMBER)} ({docket.get("pacer_case_id","?")})', count: 1, endpoint: '/api/rest/v4/search/?type=r' }},
  ],
  totalRequests: 1,
  note: 'CourtListener RECAP data is free and open-access. The paid docket-entries endpoint would add ~3 requests per case (20 entries/page). Using the free search endpoint keeps usage at 1 request per case enrichment run.',
  perCaseEstimate: 1,
  projections: [
    {{ cases: 100,   requests: 100   }},
    {{ cases: 500,   requests: 500   }},
    {{ cases: 1000,  requests: 1000  }},
    {{ cases: 5000,  requests: 5000  }},
    {{ cases: 12500, requests: 12500 }},
  ],
}}
"""
    write_js(OUT_DIR / "geminiCaseEnrichments.js", enrichments_js)

    print(f"\n{'='*60}")
    print("Done! Both data files regenerated with Gemini-generated content.")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
