import os
import time
import json
import sqlite3
import requests
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from llama_cloud_services import LlamaCloudIndex
# from llama_index.llms.groq import Groq
# Your Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# =======================
# 🔐 Load environment variables
# =======================
load_dotenv()

API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")
AGENT_ID = os.getenv("LLAMA_AGENT_ID")
PARSE_PROJECT_ID = os.getenv("LLAMA_PARSE_PROJECT_ID")

# Retrieval index variables
LLAMA_INDEX_NAME = os.getenv("LLAMA_INDEX_NAME", "ai")
LLAMA_PROJECT_NAME = os.getenv("LLAMA_PROJECT_NAME", "Default")
LLAMA_ORG_ID = os.getenv("LLAMA_ORG_ID")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY") or API_KEY

if not API_KEY:
    raise RuntimeError("❌ Missing LLAMA_CLOUD_API_KEY in .env")

# =======================
# 🌐 Flask Setup
# =======================
app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

LLAMA_BASE = "https://api.cloud.llamaindex.ai/api/v1"

# =======================
# 🗃️ SQLite Setup
# =======================
DATABASE = os.path.join(os.path.dirname(__file__), 'factures.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute("""
            CREATE TABLE IF NOT EXISTS factures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE,
                client_number TEXT,
                customer_name TEXT,
                customer_address TEXT,
                invoice_date TEXT,
                due_date TEXT,
                total_amount_before_tax REAL,
                vat_amount REAL,
                vat_percentage TEXT,
                total_amount_with_tax REAL,
                outstanding_balance REAL,
                contract_details TEXT,
                subscription_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        db.commit()

init_db()
@app.route('/parse', methods=['POST'])
def parse_file():
    """
    Upload PDF and run parse/extraction job
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    headers = {"Authorization": f"Bearer {API_KEY}"}

    try:
        # 1) Upload file
        upload_url = f"{LLAMA_BASE}/files"
        with open(filepath, 'rb') as fp:
            files = {"upload_file": (file.filename, fp, 'application/pdf')}
            upload_resp = requests.post(upload_url, headers=headers, files=files)

        if upload_resp.status_code >= 400:
            return jsonify({"error": "Upload failed", "details": upload_resp.text}), 400

        file_id = upload_resp.json().get('id')
        if not file_id:
            return jsonify({"error": "Missing file ID", "details": upload_resp.text}), 400

        # 2) Start extraction job (correct endpoint)
        job_url = f"{LLAMA_BASE}/extraction/jobs"
        job_payload = {
            "extraction_agent_id": AGENT_ID,  # your agent ID
            "file_id": file_id
        }
        job_resp = requests.post(
            job_url,
            headers={**headers, "Content-Type": "application/json"},
            json=job_payload
        )

        if job_resp.status_code >= 400:
            return jsonify({"error": "Job start failed", "details": job_resp.text}), 400

        job_id = job_resp.json().get('id')
        if not job_id:
            return jsonify({"error": "Missing job ID", "details": job_resp.text}), 400

        # 3) Poll for result
        result_url = f"{LLAMA_BASE}/extraction/jobs/{job_id}/result"
        timeout_seconds = 120
        poll_interval = 3
        elapsed = 0

        while elapsed < timeout_seconds:
            result_resp = requests.get(result_url, headers=headers)
            if result_resp.status_code == 200:
                return jsonify(result_resp.json())
            if result_resp.status_code in (202, 204) or (
                result_resp.status_code == 400 and "PENDING" in result_resp.text
            ):
                time.sleep(poll_interval)
                elapsed += poll_interval
                continue
            return jsonify({"error": "Result failed", "details": result_resp.text}), 400

        return jsonify({"error": "Extraction timeout"}), 408

    finally:
        try:
            os.remove(filepath)
        except Exception:
            pass
            
# =======================
# 📤 Upload & Extract Endpoint
# =======================
@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload PDF and run extraction job"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)
    headers = {"Authorization": f"Bearer {API_KEY}"}

    try:
        # 1) Upload file
        upload_url = f"{LLAMA_BASE}/files"
        with open(filepath, 'rb') as fp:
            files = {"upload_file": (file.filename, fp, 'application/pdf')}
            resp = requests.post(upload_url, headers=headers, files=files)
        if resp.status_code >= 400:
            return jsonify({"error": "Upload failed", "details": resp.text}), 400

        file_id = resp.json().get('id')
        if not file_id:
            return jsonify({"error": "Missing file ID", "details": resp.text}), 400

        # 2) Start extraction job
        job_url = f"{LLAMA_BASE}/extraction/jobs"
        job_payload = {"extraction_agent_id": AGENT_ID, "file_id": file_id}
        job_resp = requests.post(job_url, headers={**headers, "Content-Type": "application/json"}, json=job_payload)
        if job_resp.status_code >= 400:
            return jsonify({"error": "Job start failed", "details": job_resp.text}), 400

        job_id = job_resp.json().get('id')
        if not job_id:
            return jsonify({"error": "Missing job ID", "details": job_resp.text}), 400

        # 3) Poll for result
        result_url = f"{LLAMA_BASE}/extraction/jobs/{job_id}/result"
        timeout, interval, elapsed = 120, 3, 0
        while elapsed < timeout:
            result_resp = requests.get(result_url, headers=headers)
            if result_resp.status_code == 200:
                return jsonify(result_resp.json())
            if result_resp.status_code in (202, 204) or ("PENDING" in result_resp.text):
                time.sleep(interval)
                elapsed += interval
                continue
            return jsonify({"error": "Extraction failed", "details": result_resp.text}), 400
        return jsonify({"error": "Extraction timeout"}), 408
    finally:
        try: os.remove(filepath)
        except: pass

# =======================
# 🔍 Retrieval Endpoint
# =======================
@app.route('/retrieve', methods=['POST'])
def retrieve_from_index():
    data = request.json
    query = data.get('query')
    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        index = LlamaCloudIndex(
            name=LLAMA_INDEX_NAME,
            project_name=LLAMA_PROJECT_NAME,
            organization_id=LLAMA_ORG_ID,
            api_key=LLAMA_API_KEY,
            llm=None  # Disable LLM
        )

        # Retrieve nodes only
        retrieved_nodes = index.as_retriever().retrieve(query)

        # Build a combined answer from nodes
        answer_text = "\n\n".join([str(n) for n in retrieved_nodes]) if retrieved_nodes else "No results found."

        return jsonify({
            "query": query,
            "retrieved_nodes": [str(n) for n in retrieved_nodes],
            "answer": answer_text  # now the front-end will show something
        })
    except Exception as e:
        print("Retrieve error:", e)
        return jsonify({"error": "Retrieve failed", "details": str(e)}), 500
# =======================
# 💾 Save Facture
# =======================
@app.route('/save-facture', methods=['POST'])
def save_facture():
    data = request.json.get('data')
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO factures (
                invoice_number, client_number, customer_name, customer_address,
                invoice_date, due_date, total_amount_before_tax, vat_amount,
                vat_percentage, total_amount_with_tax, outstanding_balance,
                contract_details, subscription_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get('invoice_number'),
            data.get('client_number'),
            data.get('customer_name'),
            data.get('customer_address'),
            data.get('invoice_date'),
            data.get('due_date'),
            data.get('total_amount_before_tax'),
            data.get('vat_amount'),
            data.get('vat_percentage'),
            data.get('total_amount_with_tax'),
            data.get('outstanding_balance'),
            json.dumps(data.get('contract_details', [])),
            json.dumps(data.get('subscription_details', []))
        ))
        db.commit()
        return jsonify({"message": "Facture saved successfully"})
    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": "Invoice already exists"}), 409
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500

# =======================
# 📥 Get All Factures
# =======================
@app.route('/factures', methods=['GET'])
def get_factures():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM factures ORDER BY created_at DESC")
        rows = cursor.fetchall()
        factures = []
        for row in rows:
            facture = dict(row)
            facture['contract_details'] = json.loads(facture['contract_details'])
            facture['subscription_details'] = json.loads(facture['subscription_details'])
            factures.append(facture)
        return jsonify(factures)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =======================
# 🩺 Health Check
# =======================
@app.route('/health', methods=['GET'])
def health():
    return {"status": "ok"}, 200

# =======================
# 🏁 Run Server
# =======================
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
