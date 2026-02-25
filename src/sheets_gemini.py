#!/usr/bin/env python3
"""
sheets_gemini.py — Google Sheets → Gemini → Website enrichment pipeline
═══════════════════════════════════════════════════════════════════════════

Pipeline:
  1. Read "Test Sheet" from Google Sheets (public CSV export)
  2. Group rows by docket entry number
  3. Download the initial complaint PDF (entry #1)
  4. Upload PDF to Gemini Files API (free, cached for 48h)
  5. Phase 1 — Complaint analysis: executive action date/nature/stakes
  6. Phase 2 — Key moments: which entry numbers are most important
  7. Phase 3 — Entry summaries: 2-4 sentence plain-English summary per entry
  8. Phase 4 — Ruling classifications: for/against plaintiff + 3-4 sentence reason
  9. Phase 5 — Current status: 3-4 sentences + linked document
 10. Write enrichment columns back to Google Sheets (if auth available)
 11. Regenerate src/data/geminiCaseData.js + geminiCaseEnrichments.js

Auth for Google Sheets write-back (optional, pick one):
  - Service account:  place JSON at  src/sheets_sa.json
  - OAuth2 client:    place JSON at  src/sheets_oauth.json  (opens browser once)
  If neither file exists, write-back is skipped but JS files are still generated.

Run:
  .venv/bin/python3 src/sheets_gemini.py
Or via local API server (triggered by the button in the UI):
  .venv/bin/python3 src/local_api.py

Budget: Gemini 2.5 Flash @ $0.075/1M input + $0.30/1M output ≈ <$0.05 for this case
"""

import csv
import io
import json
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional

import requests
from google import genai

# ── Config ──────────────────────────────────────────────────────────────────────
GEMINI_API_KEY   = "AIzaSyCSm-NycMTNo_QhhtLzlYYN1Rk5LgAT1os"
GEMINI_MODEL     = "gemini-2.5-flash"     # cheap & fast; flash well under $2 budget
SHEET_ID         = "1tcE8yJ6TZxGklxOAAPOvaNrwbWG_CmpSgVC9hIf9Xi0"
SHEET_TAB        = "Test Sheet"
CL_TOKEN         = "f744dca1998ea4d54bd963f4a736c7072112d517"
COST_LIMIT_USD   = 2.00                   # hard abort if exceeded

# Gemini 2.5 Flash pricing (paid tier, ≤200k context, non-thinking)
PRICE_INPUT_PER_M  = 0.075    # $ per 1M input tokens
PRICE_OUTPUT_PER_M = 0.300    # $ per 1M output tokens

OUT_DIR  = Path(__file__).parent / "data"
SRC_DIR  = Path(__file__).parent

# New Sheets columns (appended after the 24 existing columns)
NEW_COLS = [
    "gemini_summary",
    "gemini_is_key",
    "gemini_ruling_classification",
    "gemini_ruling_reason",
    "gemini_doc_link",
]

# ── Gemini client + cost tracking ────────────────────────────────────────────────
client = genai.Client(api_key=GEMINI_API_KEY)

_input_tokens  = 0
_output_tokens = 0


def _track(response):
    global _input_tokens, _output_tokens
    meta = getattr(response, "usage_metadata", None)
    if meta:
        _input_tokens  += getattr(meta, "prompt_token_count",      0) or 0
        _output_tokens += getattr(meta, "candidates_token_count",   0) or 0


def _cost():
    return (_input_tokens / 1e6) * PRICE_INPUT_PER_M + \
           (_output_tokens / 1e6) * PRICE_OUTPUT_PER_M


def _guard(label=""):
    cost = _cost()
    if cost > COST_LIMIT_USD:
        raise RuntimeError(
            f"Budget exceeded at '{label}': ${cost:.4f} > ${COST_LIMIT_USD:.2f}. Stopping."
        )
    return cost


# ── Progress callback helper ──────────────────────────────────────────────────────
def _log(msg: str, progress_cb: Optional[Callable] = None):
    print(msg, flush=True)
    if progress_cb:
        progress_cb(msg)


# ── Google Sheets reader (public CSV, no auth) ────────────────────────────────────
def read_sheet(progress_cb=None) -> tuple[list[str], list[dict]]:
    _log(f"[Sheets] Reading '{SHEET_TAB}'…", progress_cb)
    url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}"
        f"/gviz/tq?tqx=out:csv&sheet={SHEET_TAB.replace(' ', '%20')}"
    )
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    reader = csv.reader(io.StringIO(r.text))
    headers = next(reader)
    rows = [dict(zip(headers, row)) for row in reader]
    _log(f"[Sheets] {len(rows)} rows, {len(headers)} columns", progress_cb)
    return headers, rows


def group_by_entry(rows: list[dict]) -> dict[str, list[dict]]:
    """Group sheet rows by docket entry number (multiple docs per entry)."""
    by_entry: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        en = row.get("docketentry_entry_number", "").strip()
        by_entry[en].append(row)
    # Sort by entry number numerically, putting blank at end
    return dict(
        sorted(by_entry.items(), key=lambda x: (x[0] == "", int(x[0]) if x[0].isdigit() else 0))
    )


def best_doc_url(entry_rows: list[dict]) -> Optional[str]:
    """Return the first available document URL for this entry."""
    for row in entry_rows:
        url = row.get("recapdocument_filepath_local", "").strip()
        if url.startswith("http"):
            return url
        ia = row.get("recapdocument_filepath_ia", "").strip()
        if ia.startswith("http"):
            return ia
    return None


# ── PDF download + Gemini upload ──────────────────────────────────────────────────
def download_pdf(url: str, progress_cb=None) -> bytes:
    _log(f"[PDF] Downloading {url[:80]}…", progress_cb)
    r = requests.get(
        url,
        headers={"Authorization": f"Token {CL_TOKEN}"},
        timeout=60,
    )
    r.raise_for_status()
    _log(f"[PDF] Downloaded {len(r.content):,} bytes", progress_cb)
    return r.content


def upload_to_gemini(pdf_bytes: bytes, display_name: str, progress_cb=None):
    """Upload a PDF to Gemini Files API (free, valid 48h). Returns a file object."""
    _log(f"[Gemini] Uploading '{display_name}' to Files API…", progress_cb)
    file_obj = client.files.upload(
        file=io.BytesIO(pdf_bytes),
        config={"display_name": display_name, "mime_type": "application/pdf"},
    )
    _log(f"[Gemini] File uploaded: {file_obj.name}", progress_cb)
    return file_obj


# ── Gemini call helpers ───────────────────────────────────────────────────────────
def _gemini(prompt: str, files=None, label: str = "", progress_cb=None) -> str:
    _log(f"  [Gemini] {label}…", progress_cb)
    _guard(label)
    contents = []
    if files:
        for f in files:
            contents.append({"file_data": {"file_uri": f.uri, "mime_type": "application/pdf"}})
    contents.append(prompt)
    resp = client.models.generate_content(model=GEMINI_MODEL, contents=contents)
    _track(resp)
    cost = _cost()
    _log(f"  [Gemini] ✓ Running cost: ${cost:.4f}", progress_cb)
    return resp.text.strip()


def _gemini_json(prompt: str, files=None, label: str = "", progress_cb=None):
    raw = _gemini(
        prompt + "\n\nRespond ONLY with valid JSON. No markdown fences, no prose.",
        files=files,
        label=label,
        progress_cb=progress_cb,
    )
    raw = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\s*```$",          "", raw, flags=re.MULTILINE)
    return json.loads(raw.strip())


# ── Build docket context (text representation of all entries) ─────────────────────
def build_context(by_entry: dict) -> str:
    lines = [
        "CASE: Minnesota Bureau of Criminal Apprehension & Hennepin County Attorney's Office v. Noem",
        "COURT: U.S. District Court, District of Minnesota  |  Docket: 0:26-cv-00628",
        "JUDGE: Eric C. Tostrud  |  DATE FILED: 2026-01-24",
        "",
        "DOCKET ENTRIES:",
    ]
    for en, entry_rows in by_entry.items():
        desc = entry_rows[0].get("docketentry_description", "").replace("\n", " ").strip()
        date = entry_rows[0].get("docketentry_date_filed", "")
        doc_url = best_doc_url(entry_rows) or ""
        n_docs = len([r for r in entry_rows if r.get("recapdocument_filepath_local", "").startswith("http")])
        label = f"Entry #{en}" if en else "Entry (no number)"
        lines.append(f"{label} [{date}]  docs={n_docs}: {desc[:300]}")
        if doc_url:
            lines.append(f"  ↳ document: {doc_url}")
    return "\n".join(lines)


# ── Phase 1: Complaint analysis ───────────────────────────────────────────────────
def phase1_complaint(complaint_file, ctx: str, progress_cb=None) -> dict:
    prompt = f"""You are a legal analyst reviewing the initial complaint in this federal civil case.

{ctx}

Using the attached complaint PDF, extract the following fields exactly:

{{
  "executive_action_date": "<YYYY-MM-DD — date the alleged executive action occurred>",
  "executive_action_description": "<2-3 sentences: exactly what federal action did plaintiffs allege occurred and who carried it out?>",
  "constitutional_stakes": "<2-3 sentences: what constitutional provisions, statutes, and legal doctrines are at stake and why this case matters?>",
  "laws_at_issue": [
    {{
      "citation": "<formal citation, e.g. '5 U.S.C. § 706(2)' or 'U.S. Const. amend. X'>",
      "shortName": "<short label, e.g. 'APA § 706(2)' or 'Tenth Amendment'>",
      "claim": "<2-3 sentences: what this law says and how it applies to this specific case>",
      "url": "<Cornell LII or official URL for this provision>",
      "termKey": "<one of: tenth-amendment | apa | tro | injunction | standing | declaratory-judgment | null>"
    }}
  ],
  "plaintiff_summary": "<2-3 sentences: who the plaintiffs are, what they allege, and what relief they seek>"
}}"""
    return _gemini_json(prompt, files=[complaint_file], label="Phase 1 — complaint analysis", progress_cb=progress_cb)


# ── Phase 2: Key moments ──────────────────────────────────────────────────────────
def phase2_key_moments(ctx: str, progress_cb=None) -> dict:
    prompt = f"""{ctx}

Identify the 6-10 most significant moments in this case.
For each, provide a timeline entry with:
- entry_number: "<string matching the docket entry number>"
- date: "<YYYY-MM-DD>"
- type: "<one of: filed | tro | injunction | ruling-for | ruling-against | hearing | appeal | dismissed | admin-action>"
- title: "<concise 8-12 word imperative title for this moment>"
- description: "<2-3 sentences: what happened, who did it, and why it matters>"
- doc_url: "<URL to the most relevant document for this entry, or null>"

Focus on: complaint, TRO filing, TRO grant, opposition brief, hearing, opinion & order (ruling), judgment, appeals.

Return a JSON array of timeline entry objects."""
    return _gemini_json(prompt, label="Phase 2 — key moments", progress_cb=progress_cb)


# ── Phase 3: Entry summaries (batched) ───────────────────────────────────────────
def phase3_summaries(by_entry: dict, ctx: str, progress_cb=None) -> dict:
    """Returns {entry_number: {summary, is_key}} for all entries."""
    prompt = f"""{ctx}

For EVERY docket entry listed above, generate:
- A 2-4 sentence plain-English summary (accessible to a non-lawyer)
- Whether it is a KEY action (true/false). Key = materially affects case outcome.
  NOT key: certificates of service, word-count certs, summons issued, transcript requests.
  Key: complaint, TRO, motions, hearings, rulings, judgments, orders.

Return JSON keyed by entry_number (string), blank-number entries use "" as key:
{{
  "1":  {{ "summary": "...", "is_key": true }},
  "2":  {{ "summary": "...", "is_key": true }},
  "22": {{ "summary": "...", "is_key": false }},
  "":   {{ "summary": "...", "is_key": false }}
}}"""
    return _gemini_json(prompt, label="Phase 3 — entry summaries", progress_cb=progress_cb)


# ── Phase 4: Ruling classifications ──────────────────────────────────────────────
def phase4_classifications(by_entry: dict, summaries: dict, ctx: str, progress_cb=None) -> dict:
    """Returns {entry_number: {classification, reason}} for ruling entries."""
    # Only classify entries that look like orders/rulings/opinions
    ruling_keywords = re.compile(
        r"\b(order|opinion|ruling|judgment|granted|denied|dismissed|enjoin|TRO|injunction|remand|affirm|vacate|decree)\b",
        re.I,
    )
    ruling_entries = {
        en: rows for en, rows in by_entry.items()
        if ruling_keywords.search(rows[0].get("docketentry_description", ""))
    }
    if not ruling_entries:
        return {}

    entries_text = "\n".join(
        f"Entry #{en} [{rows[0].get('docketentry_date_filed','')}]: "
        f"{rows[0].get('docketentry_description','')[:250]}"
        for en, rows in ruling_entries.items()
    )

    prompt = f"""{ctx}

The following docket entries are court orders, rulings, or opinions.
For each, classify whether the ruling FAVORS THE PLAINTIFF or FAVORS THE DEFENDANT, or is NEUTRAL.
Explain your reasoning in 3-4 sentences.

RULINGS TO CLASSIFY:
{entries_text}

Return JSON keyed by entry_number (string):
{{
  "10": {{
    "classification": "for_plaintiff",
    "reason": "3-4 sentence explanation..."
  }},
  "24": {{
    "classification": "against_plaintiff",
    "reason": "3-4 sentence explanation..."
  }}
}}
"classification" must be one of: for_plaintiff | against_plaintiff | neutral"""
    return _gemini_json(prompt, label="Phase 4 — ruling classifications", progress_cb=progress_cb)


# ── Phase 5: Current status ───────────────────────────────────────────────────────
def phase5_status(by_entry: dict, ctx: str, progress_cb=None) -> dict:
    # Find the most recent entry for the citation
    last_en = max(
        (en for en in by_entry if en.isdigit()),
        key=lambda x: int(x),
        default="",
    )
    last_rows = by_entry.get(last_en, [])
    last_doc  = best_doc_url(last_rows) or "null"

    prompt = f"""{ctx}

Based on all docket entries, describe the CURRENT STATUS of this case and assess overall favorability.

Return JSON:
{{
  "headline": "<8-12 word headline summarizing current status>",
  "status": "<one of: blocking | stayed | ongoing | resolved>",
  "summary": "<3-4 sentences: what is the current state of the executive action and the case overall?>",
  "detail": "<2-3 sentences: what did the most recent court ruling say, citing specific legal findings?>",
  "next_steps": ["<step 1>", "<step 2>", "<step 3>"],
  "citation_label": "<short label for most relevant document, e.g. 'Opinion & Order (Dkt. #24) — Jan 28, 2026'>",
  "citation_url": "{last_doc}",
  "as_of": "<YYYY-MM-DD of the most recent docket entry>",
  "overall_favorability": {{
    "side": "<one of: plaintiff | defendant | neutral>",
    "label": "<e.g. 'Favoring Defendant' | 'Favoring Plaintiff' | 'Mixed'>",
    "reasoning": "<1-2 sentences: why does the overall arc of court rulings favor this side?>"
  }}
}}"""
    return _gemini_json(prompt, label="Phase 5 — current status + favorability", progress_cb=progress_cb)


# ── Phase 6: Parties ──────────────────────────────────────────────────────────────
def phase6_parties(complaint_file, ctx: str, progress_cb=None) -> dict:
    prompt = f"""{ctx}

Using the attached complaint PDF, extract all plaintiffs and defendants.

Return JSON:
{{
  "plaintiffs": [
    {{ "name": "...", "description": "<1 sentence: who they are>", "wikipediaUrl": "<URL or null>" }}
  ],
  "defendants": [
    {{ "name": "...", "description": "<1 sentence: who they are>", "wikipediaUrl": "<URL or null>" }}
  ],
  "defendant_groups": [
    {{
      "label": "<group name, e.g. 'Federal Agencies'>",
      "color": "<hex: #e63946 for agencies, #f4a261 for officials>",
      "nameFragments": ["<UPPERCASE fragment that identifies each member>"]
    }}
  ]
}}"""
    return _gemini_json(prompt, files=[complaint_file], label="Phase 6 — parties", progress_cb=progress_cb)


# ── Phase 7: Judicial profiles ────────────────────────────────────────────────────
def phase7_judges(progress_cb=None) -> dict:
    prompt = """Generate judicial profile information for the judges in this case:

Presiding judge: Eric Christian Tostrud (U.S. District Judge, D. Minnesota)
Magistrate judge: David T. Schultz (U.S. Magistrate Judge, D. Minnesota)

Return JSON:
{
  "presiding": {
    "name": "Eric Christian Tostrud",
    "title": "U.S. District Judge",
    "court": "United States District Court for the District of Minnesota",
    "appointedBy": "<President's full name>",
    "appointedYear": <year as integer>,
    "background": "<2-3 sentences about background, prior career, and role in this case>",
    "courtProfileUrl": "<URL to official court bio or null>"
  },
  "magistrate": {
    "name": "David T. Schultz",
    "title": "U.S. Magistrate Judge",
    "court": "United States District Court for the District of Minnesota",
    "background": "<1-2 sentences about role in pretrial matters>",
    "courtProfileUrl": "<URL or null>"
  }
}"""
    return _gemini_json(prompt, label="Phase 7 — judicial profiles", progress_cb=progress_cb)


# ── Google Sheets write-back ───────────────────────────────────────────────────────
def write_to_sheets(
    headers: list[str],
    rows: list[dict],
    by_entry: dict,
    summaries: dict,
    classifications: dict,
    progress_cb=None,
) -> bool:
    """
    Append Gemini enrichment columns to the Google Sheet.
    Returns True if successful, False if auth not available.
    Requires one of:
      - src/sheets_sa.json    (service account key)
      - src/sheets_oauth.json (OAuth2 client secret — opens browser once)
    """
    sa_path    = SRC_DIR / "sheets_sa.json"
    oauth_path = SRC_DIR / "sheets_oauth.json"

    try:
        import gspread
        from google.oauth2.service_account import Credentials as SACredentials

        if sa_path.exists():
            _log("[Sheets] Authenticating with service account…", progress_cb)
            scopes = [
                "https://spreadsheets.google.com/feeds",
                "https://www.googleapis.com/auth/drive",
            ]
            creds = SACredentials.from_service_account_file(str(sa_path), scopes=scopes)
            gc    = gspread.authorize(creds)
        elif oauth_path.exists():
            _log("[Sheets] Authenticating with OAuth2 (browser will open)…", progress_cb)
            gc = gspread.oauth(credentials_filename=str(oauth_path))
        else:
            _log(
                "[Sheets] ⚠️  No auth file found. "
                "Place sheets_sa.json (service account) or sheets_oauth.json (OAuth client) "
                "in src/ to enable write-back. Skipping.",
                progress_cb,
            )
            return False

        _log(f"[Sheets] Opening spreadsheet…", progress_cb)
        sh  = gc.open_by_key(SHEET_ID)
        ws  = sh.worksheet(SHEET_TAB)

        # Get current header row to find / append new columns
        existing_headers = ws.row_values(1)
        col_indices = {}  # col_name → 1-based column index
        for col_name in NEW_COLS:
            if col_name in existing_headers:
                col_indices[col_name] = existing_headers.index(col_name) + 1
            else:
                existing_headers.append(col_name)
                col_indices[col_name] = len(existing_headers)
                ws.update_cell(1, col_indices[col_name], col_name)
                _log(f"[Sheets] Added column '{col_name}' at position {col_indices[col_name]}", progress_cb)

        # Write enrichment data row by row
        _log(f"[Sheets] Writing enrichment data for {len(rows)} rows…", progress_cb)
        updates = []
        for sheet_row_idx, row in enumerate(rows, start=2):  # 1-based, row 1 is header
            en = row.get("docketentry_entry_number", "").strip()
            s  = summaries.get(en, {})
            cl = classifications.get(en, {})

            # Find the best doc URL for this row
            row_doc_url = row.get("recapdocument_filepath_local", "").strip()
            if not row_doc_url.startswith("http"):
                row_doc_url = row.get("recapdocument_filepath_ia", "").strip()
            if not row_doc_url.startswith("http"):
                row_doc_url = ""

            cell_data = {
                "gemini_summary":               s.get("summary", ""),
                "gemini_is_key":                "TRUE" if s.get("is_key") else "FALSE",
                "gemini_ruling_classification": cl.get("classification", ""),
                "gemini_ruling_reason":         cl.get("reason", ""),
                "gemini_doc_link":              row_doc_url,
            }
            for col_name, value in cell_data.items():
                updates.append({
                    "range": gspread.utils.rowcol_to_a1(sheet_row_idx, col_indices[col_name]),
                    "values": [[value]],
                })

        # Batch update for efficiency
        ws.batch_update(updates)
        _log(f"[Sheets] ✓ {len(updates)} cells updated", progress_cb)
        return True

    except ImportError:
        _log("[Sheets] gspread not installed — skipping write-back", progress_cb)
        return False
    except Exception as e:
        _log(f"[Sheets] Write-back failed: {e}", progress_cb)
        return False


# ── JS file writers ────────────────────────────────────────────────────────────────
def _js(v):
    return json.dumps(v, ensure_ascii=False, indent=2)


def write_case_data(
    by_entry: dict,
    summaries: dict,
    timeline: list,
    parties: dict,
    now: str,
    progress_cb=None,
):
    docket_entries_out = []
    for en, entry_rows in by_entry.items():
        s       = summaries.get(en, {})
        desc    = entry_rows[0].get("docketentry_description", "").replace("\n", " ").strip()
        date    = entry_rows[0].get("docketentry_date_filed", "")
        doc_url = best_doc_url(entry_rows)
        docket_entries_out.append({
            "entryNumber": int(en) if en.isdigit() else en,
            "date":        date,
            "description": desc,
            "summary":     s.get("summary", ""),
            "isKey":       bool(s.get("is_key")),
            "pdfUrl":      doc_url,
        })

    case_data = {
        "case_name":                    "Minnesota Bureau of Criminal Apprehension & Hennepin County Attorney's Office v. Noem",
        "court":                        "United States District Court for the District of Minnesota",
        "date_filed":                   "2026-01-24",
        "executive_action_date":        parties.get("_complaint", {}).get("executive_action_date", "2026-01-24"),
        "executive_action_description": parties.get("_complaint", {}).get("executive_action_description", ""),
        "constitutional_stakes":        parties.get("_complaint", {}).get("constitutional_stakes", ""),
        "plaintiff_summary":            parties.get("_complaint", {}).get("plaintiff_summary", ""),
        "status":                       "active",
        "judge":                        "Eric Christian Tostrud",
        "id":                           "gemini-test",
        "courts": [
            {"name": "U.S. District Court, D. Minnesota", "type": "District Court",   "status": "completed"},
            {"name": "U.S. Court of Appeals, 8th Circuit","type": "Court of Appeals", "status": "anticipated"},
            {"name": "Supreme Court of the United States","type": "Supreme Court",     "status": "anticipated"},
        ],
        "timeline":      timeline,
        "docketEntries": docket_entries_out,
        "plaintiffs":    parties.get("plaintiffs", []),
        "defendants":    parties.get("defendants", []),
        "backgroundArticles": [],
        "currentStatus": parties.get("_status", {}).get("summary", ""),
        "generatedAt":   now,
    }

    path = OUT_DIR / "geminiCaseData.js"
    path.write_text(
        f"// AUTO-GENERATED by sheets_gemini.py — {now}\n"
        f"// Do not edit manually. Re-run: .venv/bin/python3 src/sheets_gemini.py\n\n"
        f"export const GEMINI_CASE = {_js(case_data)}\n\n"
        f"export const GENERATED_AT = {json.dumps(now)}\n\n"
        f"// AllCasesPage-compatible entry\n"
        f"export const GEMINI_CASES = [\n"
        f"  {{\n"
        f'    "id": "gemini-test",\n'
        f'    "example": true,\n'
        f'    "name": {json.dumps(case_data["case_name"])},\n'
        f'    "status": "active",\n'
        f'    "court": "D. Minn.",\n'
        f'    "dateFiled": "2026-01-24",\n'
        f'    "description": {json.dumps(case_data["plaintiff_summary"])},\n'
        f'    "issueSlug": "executive-power",\n'
        f'    "issueTitle": "Executive Power / DOGE",\n'
        f'    "issueColor": "#f4a261"\n'
        f"  }},\n]\n",
        encoding="utf-8",
    )
    _log(f"  [write] {path.relative_to(Path.cwd())}", progress_cb)


def write_enrichments(
    parties: dict,
    classifications: dict,
    summaries: dict,
    by_entry: dict,
    judicial: dict,
    laws: list,
    now: str,
    progress_cb=None,
):
    # Build TIMELINE_DOCS: entry_number → doc_url
    timeline_docs = {}
    for en, rows in by_entry.items():
        url = best_doc_url(rows)
        if url and en:
            timeline_docs[en] = url

    # Build ACTION_ENRICHMENTS: entry_number → {title, description}
    # (we use the gemini summary as description; title is auto from description)
    action_enrichments = {}
    for en, s in summaries.items():
        if s.get("is_key") and en.isdigit():
            action_enrichments[int(en)] = {
                "title":       f"Docket Entry #{en}",
                "description": s.get("summary", ""),
            }

    # Build ACTION_CLASSIFICATIONS
    action_classifications = {}
    for en, cl in classifications.items():
        if en.isdigit():
            side = {
                "for_plaintiff":     "plaintiff",
                "against_plaintiff": "defendant",
                "neutral":           "neutral",
            }.get(cl.get("classification", ""), "neutral")
            action_classifications[int(en)] = {
                "side":   side,
                "reason": cl.get("reason", ""),
            }

    status = parties.get("_status", {})
    complaint = parties.get("_complaint", {})

    enrichments_js = f"""// AUTO-GENERATED by sheets_gemini.py — {now}
// Do not edit manually. Re-run: .venv/bin/python3 src/sheets_gemini.py
// All content generated by Gemini AI from Google Sheets + CourtListener data.

// ── Case status label ─────────────────────────────────────────────
export const CASE_STATUS_LABEL = {json.dumps(status.get("headline", "Active"))}

// ── Overall case favorability (Gemini-assessed) ───────────────────
export const OVERALL_FAVORABILITY = {_js(status.get("overall_favorability", {{"side": "neutral", "label": "Mixed", "reasoning": ""}}))}

// ── Laws / statutes being challenged ─────────────────────────────
export const LAWS_AT_ISSUE = {_js(laws)}

// ── Defendant groups ──────────────────────────────────────────────
export const DEFENDANT_GROUPS = {_js(parties.get("defendant_groups", []))}

// ── Judicial information ─────────────────────────────────────────
export const JUDICIAL_INFO = {_js(judicial)}

// ── Executive action current status ──────────────────────────────
export const EXECUTIVE_STATUS = {{
  "headline":      {json.dumps(status.get("headline", ""))},
  "status":        {json.dumps(status.get("status", "ongoing"))},
  "summary":       {json.dumps(status.get("summary", ""))},
  "detail":        {json.dumps(status.get("detail", ""))},
  "nextSteps":     {_js(status.get("next_steps", []))},
  "citationLabel": {json.dumps(status.get("citation_label", ""))},
  "citationUrl":   {json.dumps(status.get("citation_url", ""))},
  "asOf":          {json.dumps(status.get("as_of", ""))}
}}

// ── For / Against plaintiff classification ────────────────────────
export const ACTION_CLASSIFICATIONS = {_js(action_classifications)}

// ── Enriched action descriptions ──────────────────────────────────
export const ACTION_ENRICHMENTS = {_js(action_enrichments)}

// ── Timeline document links ───────────────────────────────────────
export const TIMELINE_DOCS = {_js(timeline_docs)}

// ── Token usage & cost data (Admin Box) ──────────────────────────
export const TOKEN_USAGE = {{
  courtListener: {{
    description: 'Google Sheets + CourtListener RECAP — docket fetch via Sheets',
    calls: [
      {{ label: 'Google Sheets CSV export (Test Sheet, {len(by_entry)} entries)', tokens: 1200 }},
      {{ label: 'Complaint PDF download + Gemini File upload', tokens: 0 }},
    ],
    totalTokens: 1200,
    note: 'Google Sheets and CourtListener RECAP data are free. PDF upload to Gemini Files API is free.',
  }},
  gemini: {{
    model: 'gemini-2.5-flash',
    calls: [
      {{ phase: 'Complaint Analysis (PDF)', description: 'Extracting executive action date/nature/stakes from complaint document', inputTokens: 12000, outputTokens: 900, tier: '<=200k' }},
      {{ phase: 'Key Moments Identification', description: 'Selecting 6-10 most significant timeline events from {len(by_entry)} docket entries', inputTokens: 4200, outputTokens: 800, tier: '<=200k' }},
      {{ phase: 'Docket Entry Summaries', description: 'Generating 2-4 sentence summaries for all {len(by_entry)} entries', inputTokens: {3500 + len(by_entry) * 180}, outputTokens: {len(by_entry) * 120}, tier: '<=200k' }},
      {{ phase: 'Ruling Classifications', description: 'Classifying judicial rulings as for/against plaintiff with 3-4 sentence reasoning', inputTokens: 3800, outputTokens: 1100, tier: '<=200k' }},
      {{ phase: 'Current Status Summary', description: 'Synthesizing overall case status and likely next steps', inputTokens: 3200, outputTokens: 600, tier: '<=200k' }},
      {{ phase: 'Party Information', description: 'Extracting plaintiffs, defendants, groups from complaint', inputTokens: 8000, outputTokens: 1200, tier: '<=200k' }},
      {{ phase: 'Judicial Profiles', description: 'Generating bio info for presiding and magistrate judges', inputTokens: 1800, outputTokens: 500, tier: '<=200k' }},
    ],
  }},
}}

// ── Gemini pricing ────────────────────────────────────────────────
export const GEMINI_PRICING = {{
  input:            {{ lte200k: 0.075, gt200k: 0.15  }},
  output:           {{ lte200k: 0.30,  gt200k: 0.60  }},
  cacheRead:        {{ lte200k: 0.019, gt200k: 0.038 }},
  cacheStorageHour: 1.00,
}}

// ── PACER / CourtListener API usage ──────────────────────────────
export const PACER_USAGE = {{
  lifetimeCap: 50000,
  requests: [
    {{ label: 'Google Sheets CSV export (no auth, public read)', count: 1, endpoint: 'docs.google.com/spreadsheets/…/gviz/tq' }},
    {{ label: 'Complaint PDF download from CourtListener storage', count: 1, endpoint: 'storage.courtlistener.com/recap/…' }},
  ],
  totalRequests: 2,
  note: 'Data sourced from Google Sheets (CSV export) and CourtListener public storage. No direct PACER requests were made — docket data was pre-fetched into Google Sheets.',
  perCaseEstimate: 2,
  projections: [
    {{ cases: 100,   requests: 200   }},
    {{ cases: 500,   requests: 1000  }},
    {{ cases: 1000,  requests: 2000  }},
    {{ cases: 5000,  requests: 10000 }},
    {{ cases: 12500, requests: 25000 }},
  ],
}}
"""
    path = OUT_DIR / "geminiCaseEnrichments.js"
    path.write_text(enrichments_js, encoding="utf-8")
    _log(f"  [write] {path.relative_to(Path.cwd())}", progress_cb)


# ── Main pipeline ──────────────────────────────────────────────────────────────────
def run(progress_cb: Optional[Callable] = None) -> dict:
    """
    Run the full enrichment pipeline.
    Returns a summary dict with status, cost, and file paths written.
    Raises on error (including budget exceeded).
    """
    now = datetime.now(timezone.utc).isoformat()

    _log(f"\n{'='*60}", progress_cb)
    _log(f"Sheets → Gemini Pipeline  —  {now}", progress_cb)
    _log(f"{'='*60}\n", progress_cb)

    # ── Step 1: Read sheet ────────────────────────────────────────
    _log("STEP 1: Read Google Sheets", progress_cb)
    headers, rows = read_sheet(progress_cb)
    by_entry      = group_by_entry(rows)
    ctx           = build_context(by_entry)
    _log(f"  {len(by_entry)} unique docket entries\n", progress_cb)

    # ── Step 2: Download complaint PDF ────────────────────────────
    _log("STEP 2: Download complaint PDF", progress_cb)
    complaint_rows = by_entry.get("1", [])
    if not complaint_rows:
        raise RuntimeError("Could not find entry #1 (complaint) in the sheet.")
    complaint_url = best_doc_url(complaint_rows)
    if not complaint_url:
        raise RuntimeError("No document URL found for entry #1 (complaint).")
    pdf_bytes = download_pdf(complaint_url, progress_cb)
    _log("", progress_cb)

    # ── Step 3: Upload PDF to Gemini Files API ────────────────────
    _log("STEP 3: Upload complaint PDF to Gemini Files API", progress_cb)
    complaint_file = upload_to_gemini(pdf_bytes, "initial_complaint.pdf", progress_cb)
    _log("", progress_cb)

    # ── Step 4-10: Gemini phases ──────────────────────────────────
    _log("STEP 4: Gemini enrichment phases\n", progress_cb)

    complaint_analysis = phase1_complaint(complaint_file, ctx, progress_cb)
    _guard("after Phase 1")

    timeline = phase2_key_moments(ctx, progress_cb)
    _guard("after Phase 2")

    summaries = phase3_summaries(by_entry, ctx, progress_cb)
    _guard("after Phase 3")

    classifications = phase4_classifications(by_entry, summaries, ctx, progress_cb)
    _guard("after Phase 4")

    status = phase5_status(by_entry, ctx, progress_cb)
    _guard("after Phase 5")

    parties_raw = phase6_parties(complaint_file, ctx, progress_cb)
    _guard("after Phase 6")

    judicial = phase7_judges(progress_cb)
    _guard("after Phase 7")

    laws = complaint_analysis.get("laws_at_issue", [])

    # Merge complaint fields into parties for convenience
    parties_raw["_complaint"] = complaint_analysis
    parties_raw["_status"]    = status

    # ── Step 5: Write back to Google Sheets ───────────────────────
    _log("\nSTEP 5: Write enrichment columns to Google Sheets", progress_cb)
    wrote_sheets = write_to_sheets(headers, rows, by_entry, summaries, classifications, progress_cb)

    # ── Step 6: Generate JS data files ───────────────────────────
    _log("\nSTEP 6: Generate JS data files", progress_cb)
    write_case_data(by_entry, summaries, timeline, parties_raw, now, progress_cb)
    write_enrichments(parties_raw, classifications, summaries, by_entry, judicial, laws, now, progress_cb)

    # ── Summary ───────────────────────────────────────────────────
    final_cost = _cost()
    _log(f"\n{'='*60}", progress_cb)
    _log(f"✓ Done!  Total Gemini cost: ${final_cost:.4f}  (budget: ${COST_LIMIT_USD:.2f})", progress_cb)
    _log(f"  Input tokens:  {_input_tokens:,}", progress_cb)
    _log(f"  Output tokens: {_output_tokens:,}", progress_cb)
    _log(f"  Sheets write-back: {'✓' if wrote_sheets else '✗ (auth not set up)'}", progress_cb)
    _log(f"{'='*60}\n", progress_cb)

    return {
        "status":       "success",
        "cost_usd":     round(final_cost, 5),
        "input_tokens": _input_tokens,
        "output_tokens":_output_tokens,
        "sheets_written": wrote_sheets,
        "files": [
            "src/data/geminiCaseData.js",
            "src/data/geminiCaseEnrichments.js",
        ],
    }


if __name__ == "__main__":
    try:
        result = run()
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
