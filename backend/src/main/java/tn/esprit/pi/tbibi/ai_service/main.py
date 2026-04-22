from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from moderation import moderate_post, opt_thresh

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SanitizeRequest(BaseModel):
    text: str

class SanitizeResponse(BaseModel):
    original:   str
    cleaned:    str
    is_toxic:   bool
    confidence: float

@app.post("/sanitize", response_model=SanitizeResponse)
def sanitize(req: SanitizeRequest):
    return moderate_post(req.text)

@app.get("/health")
def health():
    return {"status": "ok", "threshold": float(opt_thresh)}