"""
app.py — Flask frontend wrapper for the Hybrid AI Legal Analysis System.

Imports and reuses analyse_document() from Notebook 03 directly.
Does NOT modify or duplicate any backend AI pipeline logic.
"""

import os
import sys
import json
import traceback

from flask import Flask, request, jsonify, render_template, send_from_directory

# ── Ensure the project root is on the path so NB03 modules resolve ────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# ── Import the completed NB03 pipeline ───────────────────────────────────────
# The notebook must have been converted to a module or its pipeline cells
# extracted into nb03_pipeline.py (see note below).
# For demo purposes we import analyse_document from nb03_pipeline.
try:
    from nb03_pipeline import analyse_document, USE_REAL_LLM
    PIPELINE_LOADED = True
except ImportError:
    PIPELINE_LOADED = False
    USE_REAL_LLM = False

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 1 * 1024 * 1024  # 1 MB upload limit

OUTPUT_DIR = "nb03_outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Sample contract for the demo button ──────────────────────────────────────
SAMPLE_CONTRACT = """SOFTWARE LICENSE AND SERVICES AGREEMENT

1. LICENSE GRANT
Licensor hereby grants to Licensee a non-exclusive, non-transferable, limited license
to use the Software solely for Licensee's internal business operations during the
term of this Agreement.

2. PAYMENT TERMS
Licensee shall pay Licensor an annual license fee of USD 50,000, due within 30 days
of invoice. Late payments shall accrue interest at 1.5% per month. Licensor reserves
the right to suspend access upon 10 days notice for non-payment.

3. TERM AND TERMINATION
This Agreement commences on the Effective Date and continues for one year, renewing
automatically unless either party provides 60 days written notice of non-renewal.
Either party may terminate immediately upon material breach if the breach remains
uncured for 30 days following written notice.

4. CONFIDENTIALITY AND NON-COMPETE
Each party agrees to maintain the confidentiality of the other party's proprietary
information. Licensee shall not develop or market any product that directly competes
with the Software for a period of two years following termination of this Agreement.

5. INTELLECTUAL PROPERTY
All intellectual property rights in the Software remain exclusively with Licensor.
Licensee shall not reverse engineer, decompile, or create derivative works based
on the Software without prior written consent.

6. LIMITATION OF LIABILITY
In no event shall either party be liable for indirect, incidental, consequential,
or punitive damages. Each party's aggregate liability shall not exceed the total
fees paid in the 12 months preceding the claim.

7. INDEMNIFICATION
Each party shall indemnify, defend, and hold harmless the other from third-party
claims arising from the indemnifying party's breach of this Agreement or gross negligence.

8. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed by the laws of the State of New York. Any disputes
shall first be subject to good-faith negotiation for 30 days, followed by binding
arbitration under the AAA Commercial Arbitration Rules."""


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html", pipeline_loaded=PIPELINE_LOADED)


@app.route("/sample")
def sample():
    """Return the sample contract text."""
    return jsonify({"text": SAMPLE_CONTRACT})


@app.route("/analyse", methods=["POST"])
def analyse():
    """
    Main analysis endpoint.
    Accepts JSON body: { "text": "...", "title": "..." }
    or multipart form with a .txt file upload.
    Calls analyse_document() and returns structured JSON.
    """
    if not PIPELINE_LOADED:
        return jsonify({
            "error": (
                "Backend pipeline not loaded. "
                "Ensure nb03_pipeline.py exists and all NB01/NB02 artifacts are present."
            )
        }), 500

    # ── Extract input ─────────────────────────────────────────────────────────
    contract_text  = ""
    contract_title = "Contract"

    if request.content_type and "multipart/form-data" in request.content_type:
        uploaded = request.files.get("file")
        if uploaded and uploaded.filename.endswith(".txt"):
            try:
                contract_text = uploaded.read().decode("utf-8", errors="replace")
            except Exception:
                return jsonify({"error": "Failed to read uploaded file."}), 400
        contract_title = request.form.get("title", "Uploaded Contract")
    else:
        data           = request.get_json(silent=True) or {}
        contract_text  = data.get("text", "").strip()
        contract_title = data.get("title", "Contract").strip() or "Contract"

    if not contract_text:
        return jsonify({"error": "No contract text provided."}), 400

    if len(contract_text) < 50:
        return jsonify({"error": "Contract text is too short to analyse."}), 400

    # ── Run pipeline ──────────────────────────────────────────────────────────
    try:
        result = analyse_document(
            document_text  = contract_text,
            contract_title = contract_title,
            verbose        = False,
        )
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Analysis pipeline failed: {str(e)}"}), 500

    if "error" in result:
        return jsonify({"error": result["error"]}), 500

    # ── Serialise clause results ───────────────────────────────────────────────
    clauses_out = []
    for r in result.get("clause_results", []):
        clauses_out.append({
            "clause_text":            r.get("clause_text", "")[:500],
            "clause_type":            r.get("clause_type", "unknown"),
            "confidence":             round(r.get("confidence", 0.0), 4),
            "risk_score":             round(r.get("risk_score", 0.0), 4),
            "risk_domains":           r.get("risk_domains", []),
            "legal_concepts":         r.get("legal_concepts", []),
            "contract_elements":      r.get("contract_elements", []),
            "dependencies":           r.get("dependencies", []),
            "plain_summary":          r.get("plain_summary", ""),
            "legal_implications":     r.get("legal_implications", ""),
            "business_implications":  r.get("business_implications", ""),
            "risk_interpretation":    r.get("risk_interpretation", ""),
        })

    report_sections = result.get("report_sections", {})

    response = {
        "contract_title":      result.get("contract_title", contract_title),
        "total_clauses":       result.get("total_clauses", 0),
        "valid_clauses":       result.get("valid_clauses", 0),
        "mean_risk_score":     result.get("mean_risk_score", 0.0),
        "max_risk_score":      result.get("max_risk_score", 0.0),
        "high_risk_clauses":   result.get("high_risk_clauses", 0),
        "clause_type_counts":  result.get("clause_type_counts", {}),
        "clauses":             clauses_out,
        "report": {
            "executive_summary":       report_sections.get("EXECUTIVE SUMMARY", ""),
            "key_risk_areas":          report_sections.get("KEY RISK AREAS", ""),
            "critical_dependencies":   report_sections.get("CRITICAL DEPENDENCIES", ""),
            "business_recommendations":report_sections.get("BUSINESS RECOMMENDATIONS", ""),
            "overall_risk_rating":     report_sections.get("OVERALL RISK RATING", ""),
        },
        "llm_mode": "real_api" if USE_REAL_LLM else "offline_fallback",
    }

    return jsonify(response)


@app.route("/outputs/<path:filename>")
def serve_output(filename):
    """Serve generated output files (images, JSON, CSV, TXT)."""
    safe_dir = os.path.abspath(OUTPUT_DIR)
    return send_from_directory(safe_dir, filename)


@app.route("/download/<filetype>")
def download(filetype):
    """Download named export files."""
    file_map = {
        "json": "contract_intelligence_report.json",
        "csv":  "clause_analysis_results.csv",
        "txt":  "contract_report.txt",
    }
    filename = file_map.get(filetype)
    if not filename:
        return "Unknown file type", 404
    filepath = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(filepath):
        return "File not yet generated. Run an analysis first.", 404
    return send_from_directory(os.path.abspath(OUTPUT_DIR), filename, as_attachment=True)


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)