import re
import joblib
from difflib import SequenceMatcher

# =============================================================================
# LOAD SAVED ARTIFACTS (from your Cell 8)
# =============================================================================
your_model  = joblib.load("primary_toxicity_model.pkl")
vectorizer  = joblib.load("primary_vectorizer.pkl")
opt_thresh  = joblib.load("optimal_threshold.pkl")

# =============================================================================
# FROM YOUR CELL 2
# =============================================================================
def advanced_clean_text(text):
    text = str(text).lower()
    HOMOGLYPH_LEET_MAP = str.maketrans({
        'а':'a','с':'c','е':'e','о':'o','р':'p','х':'x','у':'y','в':'b','н':'h','к':'k',
        '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','@':'a','!':'i','$':'s'
    })
    text = text.translate(HOMOGLYPH_LEET_MAP)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'(.)\1{2,}', r'\1', text)
    return re.sub(r'\s+', ' ', text).strip()

# =============================================================================
# FROM YOUR CELL 5
# =============================================================================
ALWAYS_SAFE_PHRASES = ["shut up and listen", "bloody hell", "oh my god", "damn good", "thank you", "thanks for"]
ASS_SAFE_CONTEXT    = {"workout", "gym", "hurts", "exercise", "pain", "injury", "training", "sore", "muscle", "back"}
POSITIVE_CONTEXT    = {"amazing", "great", "love", "awesome", "perfect", "excellent", "fantastic", "best", "good"}

def apply_context_rules(text, score):
    words      = set(re.sub(r'[^\w\s]', '', text.lower()).split())
    text_lower = text.lower()
    for phrase in ALWAYS_SAFE_PHRASES:
        if phrase in text_lower: return score * 0.1
    if "ass" in words and len(ASS_SAFE_CONTEXT & words) > 0: return score * 0.15
    if len(POSITIVE_CONTEXT & words) >= 1 and score > 0.7: return score * 0.4
    if "shut" in words and "up" in words and {"please", "listen", "just"} & words: return score * 0.3
    if words <= {"damn","hell","crap","shut","up","the","a","an","it","that","this","oh","my","god"}: return score * 0.5
    return score

BAD_WORDS = {
    "fuck","shit","bitch","ass","cunt","dick","cock","piss","bastard","damn","badass",
    "hell","crap","prick","slut","whore","twat","wank","arse","rape","stab",
    "kill","murder","moron","idiot","retard","stupid","nigger","nigga","faggot",
    "fag","motherfucker","asshole","bullshit","jackass","dumbass","stfu","wtf",
    "gtfo","kys","gay","penis","fucker","fucking","bullsh","rapee","piass",
    "pifuck","rapeed","shitt","ahole"
}

NORM_MAP = str.maketrans({
    'а':'a','с':'c','е':'e','о':'o','р':'p','х':'x','у':'y','в':'b','н':'h','к':'k',
    '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g','@':'a','!':'i','$':'s'
})

def normalize_word(word):
    w = word.lower().translate(NORM_MAP)
    w = re.sub(r'[^a-z]', '', w)
    w = re.sub(r'(.)\1{2,}', r'\1', w)
    for suf in ["ing","ed","er","est","s","es","y","ly","t","d","te","dd","ee"]:
        if w.endswith(suf) and len(w) > len(suf) + 2:
            base = w[:-len(suf)]
            if base in BAD_WORDS: return base
    return w

def smart_mask(text, mask_char="*"):
    clean_text = re.sub(r'(?<=[a-zA-Z0-9])[^\w\s]+(?=[a-zA-Z0-9])', '', text)
    tokens = re.findall(r'\w+|\W+', clean_text)
    result = []
    for tok in tokens:
        if re.match(r'\w+', tok):
            norm = normalize_word(tok)
            if norm in BAD_WORDS:
                result.append(mask_char * len(tok)); continue
            if any(re.search(r'\b' + re.escape(bad) + r'\b', norm) for bad in BAD_WORDS if len(bad) >= 4):
                result.append(mask_char * len(tok)); continue
            is_match = any(
                SequenceMatcher(None, norm, bad).ratio() >= (0.85 if len(bad) <= 5 else 0.75)
                for bad in BAD_WORDS if len(bad) >= 4 and len(norm) >= 4
            )
            result.append(mask_char * len(tok) if is_match else tok)
        else:
            result.append(tok)
    return "".join(result)

# =============================================================================
# FROM YOUR CELL 6
# =============================================================================
def moderate_post(text):
    clean_for_model = advanced_clean_text(text)
    vec             = vectorizer.transform([clean_for_model])
    raw_prob        = your_model.predict_proba(vec)[0][1]

    masked_check = smart_mask(text)
    if masked_check != text:
        raw_prob = max(raw_prob, 0.75)

    final_prob = apply_context_rules(text, raw_prob)
    is_toxic   = final_prob >= opt_thresh
    cleaned    = masked_check if is_toxic else text

    return {
        "original":   text,
        "cleaned":    cleaned,
        "is_toxic":   is_toxic,
        "confidence": round(float(final_prob), 3)
    }