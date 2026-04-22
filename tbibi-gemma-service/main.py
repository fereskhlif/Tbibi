"""
Tbibi Local AI Microservice — v6.0  (RAG + Memory + Guardrails + Segmentation)
================================================================================
New in v6:
  ● Segmentation — Python K-Means (scikit-learn) patient risk engine
  ● Care Plans   — personalised per-patient plans (LOW / MEDIUM / HIGH)
  ● /segment     — POST endpoint: receives patient vitals, returns clusters + plans
  ● /segment/patient/{id} — GET risk profile for one patient

Previous (v5):
  ● RAG          — TF-IDF search over knowledge/*.txt files
  ● Memory       — per-session conversation history (last 6 turns, 30-min TTL)
  ● Guardrails   — strict topic restriction

Run:
    python main.py
"""

import os
import time
import logging
import threading
import uuid
import math
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
log = logging.getLogger("tbibi-ai")

# ── Config ─────────────────────────────────────────────────────────────────────
GGUF_REPO      = os.getenv("GGUF_REPO",     "TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF")
GGUF_FILE      = os.getenv("GGUF_FILE",     "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")
CHAT_FORMAT    = os.getenv("CHAT_FORMAT",   "chatml")
MAX_TOKENS     = int(os.getenv("MAX_NEW_TOKENS", "512"))
TEMPERATURE    = float(os.getenv("TEMPERATURE", "0.4"))
TOP_P          = float(os.getenv("TOP_P", "0.9"))
REPEAT_PENALTY = float(os.getenv("REPEAT_PENALTY", "1.1"))
N_CTX          = int(os.getenv("N_CTX", "4096"))   # increased for memory + RAG context
N_THREADS      = os.cpu_count() or 4

SESSION_MAX_TURNS   = 6      # keep last N user+assistant pairs
SESSION_TTL_MINUTES = 30     # auto-expire idle sessions
RAG_TOP_K           = 3      # number of knowledge chunks to inject
RAG_CHUNK_SIZE      = 400    # characters per chunk

# ── Global state ───────────────────────────────────────────────────────────────
llm          = None
model_status = "loading"
model_error  = ""

# ══════════════════════════════════════════════════════════════════════════════
#  SYSTEM PROMPT  — Topic guardrails enforced here
# ══════════════════════════════════════════════════════════════════════════════
SYSTEM_PROMPT = """You are Tbibi AI, the official AI assistant for the Tbibi healthcare platform in Tunisia.

YOUR SCOPE — you ONLY answer questions about:
1. The Tbibi platform (booking, appointments, doctors, rescheduling, teleconsultation, notifications, pharmacies, labs, account management)
2. Medical and health questions (symptoms, medications, when to see a doctor, first aid guidance)

WHEN A QUESTION IS OFF-TOPIC (politics, sports, coding, general knowledge, etc.) you MUST reply:
"I'm Tbibi AI and I can only help with Tbibi platform questions or medical health questions. Could you ask me something about your health or about using the Tbibi app? 😊"

MEDICAL RULES:
- For emergencies say: 🚨 This is a medical emergency. Call SAMU 190 immediately or go to the nearest ER.
- Always end medical answers with: ⚕️ I am an AI assistant — please consult a qualified healthcare professional for a proper diagnosis.
- Emergencies: chest pain, difficulty breathing, stroke signs (face drooping, arm weakness, slurred speech), severe allergic reaction (throat swelling), loss of consciousness, fever >39.5°C with stiff neck/rash.

TBIBI PLATFORM RULES:
- When users ask about appointments, explain the booking and management process.
- When users ask about doctors, explain how to find and book with them on the platform.
- Be helpful, friendly, and concise.
- Respond in the same language the user writes in (French or English).
- Keep responses under 300 words.
- Use bullet points when listing steps or options."""


# ══════════════════════════════════════════════════════════════════════════════
#  RAG ENGINE  — TF-IDF over knowledge/*.txt files
# ══════════════════════════════════════════════════════════════════════════════
class RAGEngine:
    def __init__(self, knowledge_dir: str = "knowledge"):
        self.chunks: List[str] = []
        self.vectorizer = None
        self.matrix = None
        self._load(knowledge_dir)

    def _load(self, knowledge_dir: str):
        """Load all .txt files, chunk them, build TF-IDF index."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
        except ImportError:
            log.warning("⚠️  scikit-learn not installed — RAG disabled. Run: pip install scikit-learn")
            return

        kb_path = Path(knowledge_dir)
        if not kb_path.exists():
            log.warning(f"⚠️  Knowledge directory '{knowledge_dir}' not found — RAG disabled.")
            return

        raw_chunks = []
        for txt_file in sorted(kb_path.glob("*.txt")):
            text = txt_file.read_text(encoding="utf-8")
            # Split into overlapping chunks
            for i in range(0, len(text), RAG_CHUNK_SIZE - 50):
                chunk = text[i: i + RAG_CHUNK_SIZE].strip()
                if len(chunk) > 80:
                    raw_chunks.append(chunk)
            log.info(f"📚 Loaded: {txt_file.name} ({len(text)} chars)")

        if not raw_chunks:
            log.warning("⚠️  No chunks found in knowledge dir — RAG disabled.")
            return

        self.chunks = raw_chunks
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
        self.matrix = self.vectorizer.fit_transform(self.chunks)
        log.info(f"✅ RAG index built: {len(self.chunks)} chunks from {knowledge_dir}/")

    def retrieve(self, query: str, top_k: int = RAG_TOP_K) -> str:
        """Return the top_k most relevant knowledge chunks as a single string."""
        if self.vectorizer is None or self.matrix is None or not self.chunks:
            return ""
        try:
            import numpy as np
            q_vec = self.vectorizer.transform([query])
            scores = (self.matrix @ q_vec.T).toarray().flatten()
            top_indices = np.argsort(scores)[::-1][:top_k]
            results = [self.chunks[i] for i in top_indices if scores[i] > 0.05]
            if not results:
                return ""
            return "\n---\n".join(results)
        except Exception as e:
            log.warning(f"RAG retrieve error: {e}")
            return ""


# ══════════════════════════════════════════════════════════════════════════════
#  SESSION MEMORY  — in-memory, per session_id, auto-expiring
# ══════════════════════════════════════════════════════════════════════════════
class SessionStore:
    def __init__(self):
        self._store: Dict[str, dict] = {}
        self._lock = threading.Lock()

    def get_history(self, session_id: str) -> List[dict]:
        with self._lock:
            entry = self._store.get(session_id)
            if entry is None:
                return []
            # Check TTL
            if datetime.now() - entry["last_active"] > timedelta(minutes=SESSION_TTL_MINUTES):
                del self._store[session_id]
                return []
            entry["last_active"] = datetime.now()
            return list(entry["history"])

    def add_turn(self, session_id: str, user_msg: str, ai_msg: str):
        with self._lock:
            if session_id not in self._store:
                self._store[session_id] = {"history": [], "last_active": datetime.now()}
            entry = self._store[session_id]
            entry["history"].append({"role": "user",      "content": user_msg})
            entry["history"].append({"role": "assistant", "content": ai_msg})
            # Keep only last N turns (2 messages per turn)
            max_messages = SESSION_MAX_TURNS * 2
            if len(entry["history"]) > max_messages:
                entry["history"] = entry["history"][-max_messages:]
            entry["last_active"] = datetime.now()

    def clear(self, session_id: str):
        with self._lock:
            self._store.pop(session_id, None)

    def count(self) -> int:
        with self._lock:
            return len(self._store)


# ── Global instances ───────────────────────────────────────────────────────────
rag     = RAGEngine("knowledge")
memory  = SessionStore()


# ══════════════════════════════════════════════════════════════════════════════
#  MODEL LOADING  (background thread — server opens port immediately)
# ══════════════════════════════════════════════════════════════════════════════
def load_model_background():
    global llm, model_status, model_error
    try:
        from huggingface_hub import hf_hub_download
        log.info(f"📥 Downloading GGUF model [{GGUF_REPO} / {GGUF_FILE}] ...")
        t0 = time.time()
        model_path = hf_hub_download(repo_id=GGUF_REPO, filename=GGUF_FILE)
        log.info(f"✅ Model file ready: {model_path} ({time.time()-t0:.1f}s)")

        log.info(f"⚙️  Loading GGUF engine ({N_THREADS} CPU threads, ctx={N_CTX}) ...")
        from llama_cpp import Llama
        llm = Llama(
            model_path=model_path,
            n_ctx=N_CTX,
            n_threads=N_THREADS,
            n_gpu_layers=0,
            chat_format=CHAT_FORMAT,
            verbose=False,
        )
        model_status = "ready"
        log.info(f"🚀 AI ready in {time.time()-t0:.1f}s — {N_THREADS} CPU threads")
    except Exception as e:
        model_status = "error"
        model_error  = str(e)
        log.error(f"❌ Model loading failed: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    thread = threading.Thread(target=load_model_background, daemon=True)
    thread.start()
    log.info(f"🌐 Server live on port {os.getenv('PORT','5000')} — model loading in background ...")
    yield
    log.info("🛑 Shutting down")
    global llm
    llm = None


# ══════════════════════════════════════════════════════════════════════════════
#  FASTAPI APP
# ══════════════════════════════════════════════════════════════════════════════
app = FastAPI(
    title="Tbibi AI Service",
    description="GGUF medical assistant with RAG, session memory, and topic guardrails",
    version="5.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
#  SCHEMAS
# ══════════════════════════════════════════════════════════════════════════════
class AskRequest(BaseModel):
    question:   str
    session_id: Optional[str] = None   # UUID, generated by frontend

class AskResponse(BaseModel):
    answer:     str
    model:      str
    latency_ms: int
    session_id: str

class ClearRequest(BaseModel):
    session_id: str


# ══════════════════════════════════════════════════════════════════════════════
#  GENERATION
# ══════════════════════════════════════════════════════════════════════════════
def generate_answer(session_id: str, user_question: str) -> str:
    """
    Build messages list:
      [system] SYSTEM_PROMPT + RAG context
      [user/assistant pairs from memory]
      [user] current question
    """
    # 1. RAG retrieval
    rag_context = rag.retrieve(user_question)
    
    system_content = SYSTEM_PROMPT
    if rag_context:
        system_content += (
            "\n\n=== RELEVANT KNOWLEDGE BASE ===\n"
            + rag_context
            + "\n=== END KNOWLEDGE BASE ===\n"
            + "Use the above knowledge to answer more precisely if relevant."
        )

    # 2. Build messages
    messages = [{"role": "system", "content": system_content}]

    # 3. Inject conversation history
    history = memory.get_history(session_id)
    messages.extend(history)

    # 4. Add current question
    messages.append({"role": "user", "content": user_question.strip()})

    # 5. Call LLM
    response = llm.create_chat_completion(
        messages=messages,
        max_tokens=MAX_TOKENS,
        temperature=TEMPERATURE,
        top_p=TOP_P,
        repeat_penalty=REPEAT_PENALTY,
        stop=["<|im_end|>", "</s>", "[/INST]"],
    )
    return response["choices"][0]["message"]["content"].strip()


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/health")
def health():
    return {
        "status":        "ok",
        "model_status":  model_status,
        "model_loaded":  model_status == "ready",
        "model_error":   model_error,
        "model":         f"{GGUF_REPO}/{GGUF_FILE}",
        "threads":       N_THREADS,
        "engine":        "llama-cpp-python (GGUF)",
        "rag_chunks":    len(rag.chunks),
        "active_sessions": memory.count(),
    }


@app.post("/ask", response_model=AskResponse)
def ask(body: AskRequest):
    if model_status == "loading":
        raise HTTPException(503, "Model is still loading — please wait a moment and retry.")
    elif model_status == "error":
        raise HTTPException(500, f"Model failed to load: {model_error}")
    elif llm is None:
        raise HTTPException(503, "Model is not available — please restart the service.")

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question cannot be empty")

    # Auto-generate session ID if frontend didn't send one
    session_id = body.session_id or str(uuid.uuid4())

    log.info(f"📨 [{session_id[:8]}] Q: {question[:80]}")

    start = time.time()
    try:
        answer = generate_answer(session_id, question)
    except Exception as e:
        import traceback
        log.error(f"❌ Generation error: {e}\n{traceback.format_exc()}")
        raise HTTPException(500, f"Generation failed: {e}")

    # Save to memory
    memory.add_turn(session_id, question, answer)

    latency_ms = int((time.time() - start) * 1000)
    log.info(f"✅ [{session_id[:8]}] Done in {latency_ms}ms")

    return AskResponse(
        answer=answer,
        model=f"{GGUF_REPO}/{GGUF_FILE}",
        latency_ms=latency_ms,
        session_id=session_id,
    )


@app.post("/clear")
def clear_session(body: ClearRequest):
    """Reset conversation memory for a session."""
    memory.clear(body.session_id)
    log.info(f"🧹 Session cleared: {body.session_id[:8]}")
    return {"status": "cleared", "session_id": body.session_id}


# ══════════════════════════════════════════════════════════════════════════════
#  PATIENT RISK SEGMENTATION ENGINE  (Python / scikit-learn K-Means)
# ══════════════════════════════════════════════════════════════════════════════

# ── Segmentation Schemas ───────────────────────────────────────────────────────

class PatientInput(BaseModel):
    """One patient's aggregated vital readings sent from the Java backend."""
    patientId:            Optional[int]   = None
    patientName:          str             = "Unknown"
    avgBloodSugar:        float           = 90.0   # mg/dL
    avgBloodPressure:     float           = 110.0  # mmHg
    avgOxygenSaturation:  float           = 97.0   # %
    avgHeartRate:         float           = 72.0   # bpm
    criticalPct:          float           = 0.0    # fraction 0–1
    warningPct:           float           = 0.0    # fraction 0–1
    totalReadings:        int             = 0

class CarePlanSectionOut(BaseModel):
    title:        str
    subtitle:     str
    tips:         List[str]
    warningSigns: List[str]

class CarePlanOut(BaseModel):
    headline:      str
    callDoctorNow: bool
    sections:      List[CarePlanSectionOut]

class PatientResult(PatientInput):
    riskScore:   float           = 0.0
    riskCluster: str             = "LOW"
    carePlan:    Optional[CarePlanOut] = None

class ClusterGroupOut(BaseModel):
    label:          str
    color:          str
    icon:           str
    count:          int
    avgRiskScore:   float
    avgCriticalPct: float
    avgWarningPct:  float
    patients:       List[PatientResult]

class SegmentRequest(BaseModel):
    """POST body: list of patient summaries to cluster."""
    patients: List[PatientInput]

class SegmentResponse(BaseModel):
    runAt:         str
    totalPatients: int
    iterations:    int
    clusters:      List[ClusterGroupOut]


# ── Care-plan generator ────────────────────────────────────────────────────────

def _build_care_plan(p: PatientResult) -> CarePlanOut:
    """Generate a personalised care plan from the patient's vitals + cluster."""
    cluster   = p.riskCluster
    is_high   = cluster == "HIGH"
    is_medium = cluster == "MEDIUM"
    sections: List[CarePlanSectionOut] = []

    # 1. Blood Sugar ──────────────────────────────────────────────────────────
    bs = p.avgBloodSugar
    if bs > 0:
        bs_high     = bs > 125
        bs_elevated = 99 < bs <= 125
        subtitle = (
            f"(Hyperglycemia — avg {bs:.0f} mg/dL)" if bs_high else
            f"(Pre-diabetic range — avg {bs:.0f} mg/dL)" if bs_elevated else
            f"(Normal — avg {bs:.0f} mg/dL)"
        )
        tips = [
            "Eat balanced meals: vegetables, whole grains, lean protein",
            "Avoid sugar, soda, fizzy drinks, and fast food",
            "Drink at least 8 glasses of water per day",
            "Walk or exercise for 30 minutes daily",
            "Avoid long periods of sitting — take a 5-min walk every hour",
        ]
        if bs_high or is_high:
            tips += ["Check blood sugar 1–3 times per day and keep a log",
                     "Take insulin or prescribed medication as directed"]
        elif is_medium or bs_elevated:
            tips.append("Monitor blood sugar at least once per day")
        else:
            tips.append("Monitor blood sugar weekly to stay on track")
        sections.append(CarePlanSectionOut(
            title="🩸 Blood Sugar Plan", subtitle=subtitle, tips=tips,
            warningSigns=["Extreme thirst or dry mouth", "Frequent urination",
                          "Unusual fatigue or dizziness", "Blurred vision"]
        ))

    # 2. Blood Pressure ───────────────────────────────────────────────────────
    bp = p.avgBloodPressure
    if bp > 0:
        bp_high     = bp >= 140
        bp_elevated = 120 <= bp < 140
        subtitle = (
            f"(Hypertension — avg {bp:.0f} mmHg)" if bp_high else
            f"(Elevated — avg {bp:.0f} mmHg)" if bp_elevated else
            f"(Normal — avg {bp:.0f} mmHg)"
        )
        tips = [
            "Reduce salt intake — avoid processed and canned foods",
            "Eat fruits, vegetables, and low-fat dairy",
            "Avoid smoking and alcohol",
            "Do light exercise like walking or cycling for 30 min daily",
            "Practice relaxation techniques: deep breathing or meditation",
        ]
        if bp_high or is_high:
            tips += ["Check blood pressure daily and record results",
                     "Take prescribed antihypertensive medication regularly"]
        elif is_medium or bp_elevated:
            tips.append("Monitor blood pressure 2–3 times per week")
        else:
            tips.append("Check blood pressure monthly as a healthy habit")
        sections.append(CarePlanSectionOut(
            title="❤️ Blood Pressure Plan", subtitle=subtitle, tips=tips,
            warningSigns=["Severe headache at the back of the head",
                          "Sudden dizziness or loss of balance",
                          "Chest pain or tightness", "Blurred or double vision"]
        ))

    # 3. Oxygen Saturation ────────────────────────────────────────────────────
    spo2 = p.avgOxygenSaturation
    if spo2 > 0:
        spo2_low        = spo2 < 92
        spo2_borderline = 92 <= spo2 < 95
        subtitle = (
            f"(Low — avg {spo2:.1f}% — medical attention needed)" if spo2_low else
            f"(Borderline — avg {spo2:.1f}%)" if spo2_borderline else
            f"(Normal — avg {spo2:.1f}%)"
        )
        tips = [
            "Stay in fresh air and well-ventilated spaces",
            "Avoid smoking and second-hand smoke",
            "Practice deep-breathing exercises daily (4–7–8 technique)",
            "Maintain good posture — sit upright to open your airways",
        ]
        if spo2_low or is_high:
            tips += ["Use a pulse oximeter to check SpO₂ at least twice daily",
                     "Use supplemental oxygen therapy if prescribed by your doctor",
                     "Avoid strenuous activity until SpO₂ is above 95%"]
        elif is_medium or spo2_borderline:
            tips.append("Monitor SpO₂ with a pulse oximeter once per day")
        else:
            tips.append("Check SpO₂ weekly using a pulse oximeter")
        sections.append(CarePlanSectionOut(
            title="🫁 Oxygen Saturation Plan", subtitle=subtitle, tips=tips,
            warningSigns=["Shortness of breath at rest or with minimal activity",
                          "Blue or grey tint to lips or fingernails (cyanosis)",
                          "Rapid breathing or gasping",
                          "Confusion or difficulty staying awake"]
        ))

    # 4. Heart Rate ───────────────────────────────────────────────────────────
    hr = p.avgHeartRate
    if hr > 0:
        hr_abnormal = hr < 60 or hr > 100
        hr_high     = hr > 100
        subtitle = (
            (f"(Tachycardia — avg {hr:.0f} bpm)" if hr_high
             else f"(Bradycardia — avg {hr:.0f} bpm)") if hr_abnormal
            else f"(Normal — avg {hr:.0f} bpm)"
        )
        tips = [
            "Exercise regularly — 30 min of moderate activity most days",
            "Limit caffeine (coffee, energy drinks) to 1–2 cups per day",
            "Sleep 7–8 hours per night to allow heart recovery",
            "Manage stress through relaxation, yoga, or mindfulness",
            "Stay well-hydrated throughout the day",
        ]
        if hr_abnormal or is_high:
            tips += ["Check heart rate at rest and after activity each day",
                     "Take prescribed cardiac medication as directed",
                     "Avoid stimulants: nicotine, alcohol, and excess caffeine"]
        elif is_medium:
            tips.append("Monitor resting heart rate 3 times per week")
        else:
            tips.append("Check resting heart rate monthly")
        sections.append(CarePlanSectionOut(
            title="💓 Heart Rate Plan", subtitle=subtitle, tips=tips,
            warningSigns=["Very fast heart rate (>120 bpm) at rest",
                          "Very slow heart rate (<50 bpm) with dizziness",
                          "Chest pain, tightness, or palpitations",
                          "Feeling faint or actually fainting"]
        ))

    # 5. General advice ───────────────────────────────────────────────────────
    sections.append(CarePlanSectionOut(
        title="✅ General Daily Advice",
        subtitle="(Applies to all risk levels)",
        tips=[
            "💧 Drink 8–10 glasses of water every day",
            "😴 Sleep 7–8 hours each night",
            "🥗 Follow a Mediterranean-style diet: vegetables, fish, olive oil",
            "⚖️ Maintain a healthy body weight (BMI 18.5–24.9)",
            "🚭 Avoid smoking and limit alcohol consumption",
            "🩺 Keep all scheduled medical check-up appointments",
            "📋 Follow your doctor's advice and take medications as prescribed",
        ],
        warningSigns=[]
    ))

    # Headline ────────────────────────────────────────────────────────────────
    if is_high:
        headline = ("🚨 HIGH RISK — Your vitals require immediate medical attention. "
                    "Please call your doctor or visit the nearest clinic as soon as possible.")
    elif is_medium:
        headline = ("⚠️ MEDIUM RISK — Your vitals are outside normal ranges. "
                    "Follow this plan carefully and consult your doctor soon.")
    else:
        headline = ("✅ LOW RISK — Your vitals look healthy! "
                    "Keep up your good habits and continue monitoring regularly.")

    return CarePlanOut(headline=headline, callDoctorNow=is_high, sections=sections)


# ── K-Means engine ────────────────────────────────────────────────────────────

# Feature weights: BS, BP, SpO2(inv), HR, critical%, warning%
_WEIGHTS = [0.15, 0.15, 0.15, 0.10, 0.30, 0.15]

def _to_raw(p: PatientInput) -> List[float]:
    return [p.avgBloodSugar, p.avgBloodPressure, p.avgOxygenSaturation,
            p.avgHeartRate, p.criticalPct, p.warningPct]

def _risk_score_norm(row: List[float]) -> float:
    """Weighted risk score from a NORMALISED feature vector."""
    w = _WEIGHTS
    score = (w[0]*row[0] + w[1]*row[1] + w[2]*(1.0 - row[2])   # SpO2 inverted
             + w[3]*row[3] + w[4]*row[4] + w[5]*row[5])
    return max(0.0, min(1.0, score))

def _risk_score_absolute(p: PatientInput) -> float:
    """Risk score for a single patient against fixed medical reference ranges."""
    w = _WEIGHTS
    norm_bs   = max(0.0, min(1.0, (p.avgBloodSugar       - 90)  / (180 - 90)))
    norm_bp   = max(0.0, min(1.0, (p.avgBloodPressure    - 90)  / (160 - 90)))
    norm_spo2 = max(0.0, min(1.0, 1.0 - (p.avgOxygenSaturation - 85) / (100 - 85)))
    norm_hr   = max(0.0, min(1.0, abs(p.avgHeartRate - 70) / 60.0))
    return max(0.0, min(1.0,
        w[0]*norm_bs + w[1]*norm_bp + w[2]*norm_spo2
        + w[3]*norm_hr + w[4]*p.criticalPct + w[5]*p.warningPct
    ))

def _run_kmeans(patients: List[PatientInput]) -> SegmentResponse:
    """Full K-Means pipeline. Uses scikit-learn when available, falls back to pure Python."""
    n = len(patients)
    if n == 0:
        return SegmentResponse(
            runAt=datetime.now().isoformat(), totalPatients=0,
            iterations=0, clusters=[]
        )

    raw = [_to_raw(p) for p in patients]
    F   = len(raw[0])

    # ── 1. Normalise (min-max per feature) ───────────────────────────────────
    mins = [min(row[j] for row in raw) for j in range(F)]
    maxs = [max(row[j] for row in raw) for j in range(F)]
    def _norm_row(row):
        return [(row[j] - mins[j]) / (maxs[j] - mins[j]) if maxs[j] != mins[j] else 0.5
                for j in range(F)]
    norm = [_norm_row(r) for r in raw]

    # ── 2. Single-patient shortcut ───────────────────────────────────────────
    if n == 1:
        score = _risk_score_absolute(patients[0])
        label = "HIGH" if score >= 0.6 else "MEDIUM" if score >= 0.35 else "LOW"
        results = [_make_patient_result(patients[0], score, label)]
        return _build_response(results, 0)

    # ── 3. K-Means (k = min(3, n)) ───────────────────────────────────────────
    k    = min(3, n)
    iters = 0
    try:
        from sklearn.cluster import KMeans
        km = KMeans(n_clusters=k, n_init=10, max_iter=100, random_state=42)
        import numpy as np
        X = np.array(norm)
        assignments = km.fit_predict(X).tolist()
        centroids   = km.cluster_centers_.tolist()
        iters       = km.n_iter_
        log.info(f"✅ sklearn KMeans converged in {iters} iter(s) with k={k}")
    except ImportError:
        log.warning("⚠️  scikit-learn not found — using pure-Python K-Means fallback")
        assignments, centroids, iters = _pure_kmeans(norm, k)

    # ── 4. Score each patient ────────────────────────────────────────────────
    scores = [_risk_score_norm(norm[i]) for i in range(n)]

    # ── 5. Label clusters LOW / MEDIUM / HIGH by centroid risk score ─────────
    centroid_scores = {ci: _risk_score_norm(centroids[ci]) for ci in range(k)}
    sorted_clusters = sorted(centroid_scores, key=centroid_scores.get)
    labels_map = {sorted_clusters[i]: ["LOW", "MEDIUM", "HIGH"][i]
                  for i in range(k)}

    results = [_make_patient_result(patients[i], scores[i], labels_map[assignments[i]])
               for i in range(n)]

    return _build_response(results, iters)


def _pure_kmeans(norm: List[List[float]], k: int):
    """Pure-Python K-Means fallback (no scikit-learn required)."""
    F = len(norm[0])
    step = max(1, len(norm) // k)
    centroids = [norm[min(i * step, len(norm) - 1)][:] for i in range(k)]
    assignments = [0] * len(norm)
    iters = 0
    for _ in range(100):
        changed = False
        new_assign = []
        for row in norm:
            dists = [math.sqrt(sum((row[j] - c[j])**2 for j in range(F))) for c in centroids]
            best  = dists.index(min(dists))
            new_assign.append(best)
        if new_assign != assignments:
            changed = True
        assignments = new_assign
        # Recompute centroids
        new_c = [[0.0]*F for _ in range(k)]
        counts = [0]*k
        for i, ci in enumerate(assignments):
            counts[ci] += 1
            for j in range(F):
                new_c[ci][j] += norm[i][j]
        for ci in range(k):
            if counts[ci]:
                centroids[ci] = [new_c[ci][j] / counts[ci] for j in range(F)]
        iters += 1
        if not changed:
            break
    return assignments, centroids, iters


def _make_patient_result(p: PatientInput, score: float, cluster: str) -> PatientResult:
    # Build a temporary shell to generate the care plan (score + cluster known)
    data = p.model_dump()
    data["riskScore"]   = score
    data["riskCluster"] = cluster
    data["carePlan"]    = None          # temporary; replaced immediately below

    shell = PatientResult.model_construct(**data)   # skip validation for temp shell
    care_plan = _build_care_plan(shell)

    return PatientResult(**p.model_dump(), riskScore=score, riskCluster=cluster,
                         carePlan=care_plan)


def _build_response(results: List[PatientResult], iters: int) -> SegmentResponse:
    meta = [
        ("LOW",    "#22c55e", "🟢"),
        ("MEDIUM", "#f59e0b", "🟡"),
        ("HIGH",   "#ef4444", "🔴"),
    ]
    clusters = []
    by_label: Dict[str, List[PatientResult]] = {"LOW": [], "MEDIUM": [], "HIGH": []}
    for pr in results:
        by_label[pr.riskCluster].append(pr)

    for label, color, icon in meta:
        members = by_label[label]
        clusters.append(ClusterGroupOut(
            label=label, color=color, icon=icon,
            count=len(members),
            avgRiskScore  =sum(m.riskScore    for m in members) / len(members) if members else 0.0,
            avgCriticalPct=sum(m.criticalPct  for m in members) / len(members) if members else 0.0,
            avgWarningPct =sum(m.warningPct   for m in members) / len(members) if members else 0.0,
            patients=members,
        ))

    return SegmentResponse(
        runAt=datetime.now().isoformat(),
        totalPatients=len(results),
        iterations=iters,
        clusters=clusters,
    )


# ── Segmentation endpoints ────────────────────────────────────────────────────

@app.post("/segment", response_model=SegmentResponse)
def segment(body: SegmentRequest):
    """
    Run K-Means risk segmentation on the supplied patient list.

    Called by the Java backend's RiskSegmentationService which supplies
    pre-aggregated patient vital averages.
    """
    if not body.patients:
        raise HTTPException(400, "No patient data supplied")
    log.info(f"🔬 /segment — {len(body.patients)} patient(s) received")
    result = _run_kmeans(body.patients)
    log.info(f"✅ /segment — done: {result.totalPatients} patients, {result.iterations} iter(s)")
    return result


@app.get("/segment/patient/{patient_id}")
def segment_patient(patient_id: int, body: SegmentRequest):
    """
    Run full clustering then return only the result for patient_id.
    NOTE: Pass the full patient list as a query body (used by Java).
    """
    result = _run_kmeans(body.patients)
    for cluster in result.clusters:
        for p in cluster.patients:
            if p.patientId == patient_id:
                return p
    raise HTTPException(404, f"Patient {patient_id} not found in segmentation result")



# ══════════════════════════════════════════════════════════════════════════════
#  DISEASE RISK PREDICTION ENGINE  (Random Forest — trained on CSV)
# ══════════════════════════════════════════════════════════════════════════════

import json as _json
from pathlib import Path as _Path

_MODEL_PATH = _Path(__file__).parent / "disease_risk_model.joblib"
_META_PATH  = _Path(__file__).parent / "disease_risk_model.meta.json"

# Loaded at startup — None if model file not found yet
_disease_bundle: Optional[Any] = None

def _load_disease_model():
    global _disease_bundle
    if _MODEL_PATH.exists():
        try:
            import joblib
            _disease_bundle = joblib.load(str(_MODEL_PATH))
            labels = _disease_bundle["label_cols"]
            log.info(f"✅ Disease risk model loaded — labels: {labels}")
        except Exception as e:
            log.error(f"❌ Failed to load disease risk model: {e}")
            _disease_bundle = None
    else:
        log.warning(
            "⚠️  Disease risk model not found. "
            "Run: python train_disease_model.py"
        )

# Load model when the module is imported (at server start)
_load_disease_model()


# ── Schemas ───────────────────────────────────────────────────────────────────

class DiseaseRiskInput(BaseModel):
    """Patient health features for disease risk prediction."""
    age:               float   # years (18–90)
    bmi:               float   # kg/m²
    systolic_bp:       float   # mmHg
    fasting_glucose:   float   # mg/dL
    smoking:           int     # 0 = No, 1 = Yes
    physical_activity: int     # days/week (0–7)
    family_history:    int     # 0 = No, 1 = Yes
    cholesterol:       float   # mg/dL

class DiseaseRiskResult(BaseModel):
    disease:     str
    atRisk:      bool
    probability: float   # 0.0 – 1.0
    label:       str     # human-readable label
    color:       str     # hex colour for UI

class DiseaseRiskResponse(BaseModel):
    predictions: List[DiseaseRiskResult]
    overallRisk: str     # LOW / MEDIUM / HIGH
    summary:     str


# ── Helpers ───────────────────────────────────────────────────────────────────

_DISEASE_META = {
    "heart_disease_risk":        {"label": "Heart Disease",      "color": "#ef4444", "icon": "❤️"},
    "high_blood_pressure_risk":  {"label": "High Blood Pressure","color": "#f97316", "icon": "🩺"},
    "diabetes_risk":             {"label": "Diabetes",           "color": "#a855f7", "icon": "🩸"},
    "lung_disease_risk":         {"label": "Lung Disease",       "color": "#3b82f6", "icon": "🫁"},
}

def _overall_risk(predictions: List[DiseaseRiskResult]) -> tuple[str, str]:
    at_risk   = [p for p in predictions if p.atRisk]
    avg_prob  = sum(p.probability for p in predictions) / len(predictions)

    if len(at_risk) >= 3 or avg_prob >= 0.6:
        return "HIGH", ("🚨 You are at HIGH risk for multiple conditions. "
                        "Please consult a doctor as soon as possible.")
    elif len(at_risk) >= 1 or avg_prob >= 0.35:
        return "MEDIUM", ("⚠️ You have MEDIUM risk indicators. "
                          "Consider lifestyle changes and schedule a check-up.")
    else:
        return "LOW", ("✅ Your risk indicators look LOW. "
                       "Keep maintaining your healthy habits!")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.post("/predict-risk", response_model=DiseaseRiskResponse)
def predict_risk(body: DiseaseRiskInput):
    """
    Predict potential disease risk for a patient using the trained
    Random Forest model (disease_risk_model.joblib).

    Run `python train_disease_model.py` first to generate the model file.
    """
    if _disease_bundle is None:
        raise HTTPException(
            503,
            detail="Disease risk model not loaded. "
                   "Run: python train_disease_model.py"
        )

    bundle   = _disease_bundle
    model    = bundle["model"]
    features = bundle["feature_cols"]
    labels   = bundle["label_cols"]

    # Build feature vector in the correct order
    x = [[
        body.age, body.bmi, body.systolic_bp, body.fasting_glucose,
        body.smoking, body.physical_activity, body.family_history, body.cholesterol
    ]]

    # Predict class + probability for each label
    predicted_classes = model.predict(x)[0]              # shape: (n_labels,)
    proba_list        = model.predict_proba(x)            # list of (1, 2) arrays

    results = []
    for i, label_key in enumerate(labels):
        at_risk   = bool(predicted_classes[i] == 1)
        prob      = float(proba_list[i][0][1])            # P(class=1)
        meta      = _DISEASE_META.get(label_key, {})
        results.append(DiseaseRiskResult(
            disease     = label_key,
            atRisk      = at_risk,
            probability = round(prob, 3),
            label       = meta.get("label",  label_key),
            color       = meta.get("color",  "#6b7280"),
        ))

    overall, summary = _overall_risk(results)
    log.info(f"🔮 /predict-risk → overall={overall} | risks={[r.disease for r in results if r.atRisk]}")

    return DiseaseRiskResponse(
        predictions = results,
        overallRisk = overall,
        summary     = summary,
    )


@app.get("/predict-risk/features")
def prediction_features():
    """
    Returns the feature schema used by the model —
    useful for building the frontend form with correct ranges.
    """
    if _META_PATH.exists():
        return _json.loads(_META_PATH.read_text())

    # Fallback static schema if meta file not generated yet
    return {
        "features": {
            "age":               {"min": 18,  "max": 90,  "mean": 45,  "type": "number", "step": 1},
            "bmi":               {"min": 15,  "max": 45,  "mean": 25,  "type": "number", "step": 0.1},
            "systolic_bp":       {"min": 90,  "max": 200, "mean": 120, "type": "number", "step": 1},
            "fasting_glucose":   {"min": 70,  "max": 300, "mean": 95,  "type": "number", "step": 1},
            "smoking":           {"min": 0,   "max": 1,   "mean": 0,   "type": "toggle"},
            "physical_activity": {"min": 0,   "max": 7,   "mean": 3,   "type": "number", "step": 1},
            "family_history":    {"min": 0,   "max": 1,   "mean": 0,   "type": "toggle"},
            "cholesterol":       {"min": 100, "max": 350, "mean": 200, "type": "number", "step": 1},
        },
        "labels": [
            "heart_disease_risk", "high_blood_pressure_risk",
            "diabetes_risk", "lung_disease_risk"
        ]
    }


# ══════════════════════════════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        reload=False,
        log_level="info",
    )
