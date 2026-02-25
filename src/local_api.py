#!/usr/bin/env python3
"""
local_api.py — Development API server for the lawsuit tracker
════════════════════════════════════════════════════════════════
Exposes the Sheets→Gemini enrichment pipeline as a local HTTP API
so the React UI's admin button can trigger it.

Run:
  .venv/bin/python3 src/local_api.py

Endpoints:
  GET  /api/health        — confirm server is running
  POST /api/enrich        — run the full Sheets→Gemini pipeline
                            streams Server-Sent Events (SSE) with progress
  GET  /api/cost-estimate — return rough cost estimate without running

The React UI connects to http://localhost:5174 (default VITE dev port = 5173,
so we use 5174 to avoid conflicts).
"""

import json
import queue
import threading
from datetime import datetime

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:4173"]}})

API_PORT = 5174


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "time":   datetime.utcnow().isoformat() + "Z",
        "server": "lawsuits-tracker local API",
    })


@app.get("/api/cost-estimate")
def cost_estimate():
    """Quick estimate without running the pipeline."""
    return jsonify({
        "model":         "gemini-2.5-flash",
        "price_input":   "$0.075 / 1M tokens",
        "price_output":  "$0.30 / 1M tokens",
        "estimated_input_tokens":  48000,
        "estimated_output_tokens": 12000,
        "estimated_cost_usd":      0.008,
        "budget_usd":              2.00,
        "note": "Actual cost will vary. Flash model keeps this well under $0.10.",
    })


@app.post("/api/enrich")
def enrich():
    """
    Run the Sheets→Gemini pipeline and stream progress via SSE.

    Client usage:
      const es = new EventSource('/api/enrich'); // won't work — POST needs EventSource workaround
    Instead, the React UI uses fetch() with a streaming reader.

    Each SSE line: `data: <json>\n\n`
    Events:
      { type: "log",     message: "..." }
      { type: "done",    result: { cost_usd, files, ... } }
      { type: "error",   message: "..." }
    """
    log_queue: queue.Queue = queue.Queue()
    result_holder = [None]
    error_holder  = [None]

    def progress_cb(msg: str):
        log_queue.put({"type": "log", "message": msg})

    def worker():
        try:
            # Import here to avoid circular import at module level
            import sys, os
            sys.path.insert(0, os.path.dirname(__file__))
            import sheets_gemini
            # Reset token counters for a fresh run
            sheets_gemini._input_tokens  = 0
            sheets_gemini._output_tokens = 0
            result = sheets_gemini.run(progress_cb=progress_cb)
            result_holder[0] = result
        except Exception as e:
            error_holder[0] = str(e)
        finally:
            log_queue.put(None)  # sentinel

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()

    def generate():
        while True:
            item = log_queue.get()
            if item is None:
                # Pipeline finished
                if error_holder[0]:
                    yield f"data: {json.dumps({'type': 'error', 'message': error_holder[0]})}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'done', 'result': result_holder[0]})}\n\n"
                break
            yield f"data: {json.dumps(item)}\n\n"

    return Response(generate(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


if __name__ == "__main__":
    print(f"\n{'='*55}")
    print(f"  Lawsuit Tracker — Local API Server")
    print(f"  http://localhost:{API_PORT}")
    print(f"  POST /api/enrich   — run Sheets→Gemini pipeline")
    print(f"  GET  /api/health   — health check")
    print(f"{'='*55}\n")
    app.run(port=API_PORT, debug=False, threaded=True)
