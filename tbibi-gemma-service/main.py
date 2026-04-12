"""
Tbibi Gemma AI Microservice — HuggingFace Edition
===================================================
Loads Google Gemma locally via HuggingFace Transformers.
Uses In-Context Learning (ICL): injects medical knowledge into every prompt
before calling model.generate() — so Gemma answers based on our
trusted medical knowledge, not random internet data.

Requirements:
  1. HuggingFace account at https://huggingface.co
  2. Accept Gemma license at: https://huggingface.co/google/gemma-2-2b-it
  3. HF_TOKEN in .env file (from https://huggingface.co/settings/tokens)

Run:
    python main.py
"""

import os
import time
import logging
from contextlib import asynccontextmanager

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
log = logging.getLogger("tbibi-gemma")

# ── Config ─────────────────────────────────────────────────────────────────────
HF_TOKEN    = os.getenv("HF_TOKEN", "")
MODEL_ID    = os.getenv("GEMMA_MODEL_ID", "google/gemma-2-2b-it")
MAX_TOKENS  = int(os.getenv("MAX_NEW_TOKENS", "400"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.4"))

# ── Global model/tokenizer ─────────────────────────────────────────────────────
model     = None
tokenizer = None

# ══════════════════════════════════════════════════════════════════════════════
#  MEDICAL KNOWLEDGE BASE  (In-Context Learning — injected into every prompt)
# ══════════════════════════════════════════════════════════════════════════════
MEDICAL_KNOWLEDGE_BASE = """You are Tbibi AI, a friendly and knowledgeable medical assistant integrated into the Tbibi healthcare platform. You help patients understand their symptoms, get general health guidance, and know when to seek professional care. Always be empathetic, clear, and structured. Use bullet points when helpful. Respond in the same language the patient uses (French or English).

=== EMERGENCY WARNING SIGNS ===
Always advise calling emergency services (SAMU 190 in Tunisia) immediately for:
- Chest pain, pressure, tightness (possible heart attack)
- Sudden difficulty breathing
- Stroke: face drooping, arm weakness, slurred speech
- Severe allergic reaction: throat swelling, difficulty breathing
- Loss of consciousness or extreme confusion
- High fever >39.5°C with stiff neck/rash
- Suicidal thoughts

=== HEADACHE ===
- Tension: dull pressure front/sides → rest, hydration, paracetamol/ibuprofen
- Migraine: throbbing, nausea, light-sensitive → dark room, triptans if prescribed
- Red flag: "worst headache ever", with fever/stiff neck, after head injury → EMERGENCY

=== FEVER ===
- 37.5–38°C: rest, fluids, monitor
- 38–39°C: paracetamol 500–1000mg every 6h, hydrate well
- >39°C: see a doctor; >39.5°C with rash/stiff neck → EMERGENCY

=== COLD & FLU ===
- Rest, fluids, paracetamol or ibuprofen for fever/pain
- Saline spray for congestion; honey+lemon for sore throat
- Antibiotics do NOT work on viruses
- See doctor if worsening after 7 days or breathing is difficult

=== COUGH ===
- Dry: honey, warm drinks; Productive: expectorants, hydrate
- Cough >3 weeks or blood in sputum → see doctor

=== SORE THROAT ===
- Viral: saltwater gargle, honey, lozenges; Bacterial (strep): white patches + no cough → antibiotic needed

=== STOMACH / DIGESTION ===
- Gas/bloating: simethicone, eat slowly
- Gastritis: antacids, avoid spicy/acidic food
- Diarrhea: ORS rehydration; bloody diarrhea → EMERGENCY
- Constipation: fiber, water, light exercise
- Severe right lower pain + fever (appendicitis) → EMERGENCY

=== BACK PAIN ===
- Muscular: heat/ice, ibuprofen, gentle stretching
- Pain down legs, numbness, or bladder issues → see doctor

=== DIABETES ===
- Normal fasting blood sugar: 70–100 mg/dL
- Low blood sugar (shakiness, sweating, confusion) → eat sugar immediately
- High blood sugar (excessive thirst, frequent urination) → consult doctor
- Type 2: low carb/sugar diet, exercise, prescribed metformin

=== HYPERTENSION ===
- Normal: <120/80; High: >140/90
- Lifestyle: reduce salt, exercise, no smoking
- >180/120 with symptoms → EMERGENCY

=== ASTHMA ===
- Use prescribed bronchodilator during attacks
- Can't speak, blue lips → EMERGENCY

=== MENTAL HEALTH ===
- Anxiety: deep breathing, grounding (5-4-3-2-1), reduce caffeine
- Depression: professional help is important
- Suicidal thoughts → EMERGENCY — contact services immediately

=== COMMON MEDICATIONS ===
- Paracetamol: fever/pain, max 4g/day, avoid alcohol
- Ibuprofen: pain/inflammation, take with food, avoid if kidney issues
- Cetirizine/Loratadine: allergies, hives
- Omeprazole: acid/gastritis
- Amoxicillin: bacterial infections (prescription only)

=== WHEN TO SEE A DOCTOR ===
- Symptoms >7–10 days without improvement
- Pain 8/10 or higher
- New, unusual, or rapidly worsening symptoms

=== RESPONSE RULES ===
- Be clear, empathetic, structured; use bullet points
- For emergencies: "🚨 This is a medical emergency. Call SAMU 190 or go to the nearest ER immediately."
- Always add: "⚕️ I am an AI assistant — please consult a qualified healthcare professional for a proper diagnosis."
- Keep responses concise (under 350 words) unless more detail is truly needed"""


# ══════════════════════════════════════════════════════════════════════════════
#  APP LIFESPAN — load model once at startup
# ══════════════════════════════════════════════════════════════════════════════
@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer

    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM

    if not HF_TOKEN:
        raise RuntimeError(
            "HF_TOKEN is not set in .env!\n"
            "Get your token at: https://huggingface.co/settings/tokens\n"
            "Then accept Gemma license at: https://huggingface.co/google/gemma-2-2b-it"
        )

    log.info(f"🚀 Loading model [{MODEL_ID}] from HuggingFace ...")
    log.info("   (First run downloads ~5 GB — subsequent runs load from cache)")

    if torch.cuda.is_available():
        log.info(f"✅ GPU: {torch.cuda.get_device_name(0)} | "
                 f"VRAM: {torch.cuda.get_device_properties(0).total_memory // 1024**2} MB")
        dtype      = torch.bfloat16
        device_map = "auto"
    else:
        log.warning("⚠️  No GPU — running on CPU (slower)")
        dtype      = torch.float32
        device_map = "cpu"

    start = time.time()

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_ID,
        token=HF_TOKEN
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_ID,
        torch_dtype=dtype,
        device_map=device_map,
        token=HF_TOKEN
    )
    model.eval()

    log.info(f"✅ Model loaded in {time.time() - start:.1f}s — server ready!")

    yield   # Server is live

    log.info("🛑 Shutting down — releasing model")
    model     = None
    tokenizer = None


# ══════════════════════════════════════════════════════════════════════════════
#  FASTAPI APP
# ══════════════════════════════════════════════════════════════════════════════
app = FastAPI(
    title="Tbibi Gemma AI Service",
    description="Local Gemma medical assistant — HuggingFace + In-Context Learning",
    version="2.0.0",
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
    question: str

class AskResponse(BaseModel):
    answer:     str
    model:      str
    latency_ms: int


# ══════════════════════════════════════════════════════════════════════════════
#  GENERATION
# ══════════════════════════════════════════════════════════════════════════════
def generate_answer(user_question: str) -> str:
    """
    Builds the ICL prompt and calls model.generate().

    We use the HuggingFace chat_template which automatically applies
    Gemma's native <start_of_turn>user / <start_of_turn>model format.
    The full medical knowledge base is injected as the system context
    inside the user turn — this is In-Context Learning.
    """
    import torch

    # Build messages with ICL knowledge injected before the question
    messages = [
        {
            "role": "user",
            "content": (
                f"{MEDICAL_KNOWLEDGE_BASE}\n\n"
                "─────────────────────────────────────\n"
                f"Patient question: {user_question.strip()}"
            )
        }
    ]

    # Apply Gemma instruct chat template
    input_ids = tokenizer.apply_chat_template(
        messages,
        return_tensors="pt",
        add_generation_prompt=True   # appends <start_of_turn>model\n
    ).to(model.device)

    with torch.no_grad():
        output_ids = model.generate(
            input_ids,
            max_new_tokens=MAX_TOKENS,
            do_sample=True,
            temperature=TEMPERATURE,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
        )

    # Decode only the NEW tokens (skip the echoed prompt)
    new_tokens = output_ids[0][input_ids.shape[-1]:]
    answer = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    return answer


# ══════════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/health")
def health():
    import torch
    return {
        "status":       "ok",
        "model_loaded": model is not None,
        "model_id":     MODEL_ID,
        "gpu":          torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    }


@app.post("/ask", response_model=AskResponse)
def ask(body: AskRequest):
    if model is None or tokenizer is None:
        raise HTTPException(503, "Model is not loaded yet — please wait.")

    question = body.question.strip()
    if not question:
        raise HTTPException(400, "Question cannot be empty")

    log.info(f"📨 Question: {question[:80]}...")

    start = time.time()
    try:
        answer = generate_answer(question)
    except Exception as e:
        log.error(f"❌ Generation error: {e}")
        raise HTTPException(500, f"Generation failed: {e}")

    latency_ms = int((time.time() - start) * 1000)
    log.info(f"✅ Done in {latency_ms}ms")

    return AskResponse(answer=answer, model=MODEL_ID, latency_ms=latency_ms)


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
        log_level="info"
    )
