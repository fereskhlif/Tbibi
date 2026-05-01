# AI Service

FastAPI service for hosting multiple AI models.

## Structure

```
ai_service/
├── app.py                      # Main FastAPI app
├── models/
│   ├── base.py                 # Base model class
│   ├── fracture_detector.py    # Fracture detection model
│   └── example_template.py     # Template for new models
├── weights/
│   ├── fracture_model_v2.pt    # Fracture model weights
│   └── your_model.pt           # Put your model files here
└── requirements.txt
```

## Setup & Run

```bash
cd ai_service
pip install -r requirements.txt
python app.py
```

Service runs on `http://localhost:5000`
- Interactive docs: `http://localhost:5000/docs`
- Health check: `http://localhost:5000/health`

## Adding Your Model

### 1. Add model weights
Put your model file in `weights/` directory:
```bash
cp /path/to/your_model.pt weights/
```

### 2. Create model module
Copy the template:
```bash
cp models/example_template.py models/your_model.py
```

Edit `models/your_model.py`:
```python
from fastapi import APIRouter, File, UploadFile, HTTPException
from .base import BaseModel

router = APIRouter()

class YourModel(BaseModel):
    def __init__(self):
        self.device = "cpu"  # or "cuda"
        super().__init__('weights/your_model.pt')
    
    def load_model(self):
        try:
            self.model = load_your_model(self.model_path)
            print("Model loaded")
        except Exception as e:
            print(f"Error: {e}")
            self.model = None
    
    async def predict(self, image: UploadFile):
        if not self.is_loaded():
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        img_bytes = await image.read()
        # Your inference logic
        result = self.model.predict(img_bytes)
        return {"prediction": result}

model = YourModel()

@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    return await model.predict(image)

@router.get("/health")
def health():
    return {"status": "ok" if model.is_loaded() else "error"}
```

### 3. Register in main app
Edit `app.py`:
```python
from models.your_model import router as your_router

app.include_router(your_router, prefix="/your-endpoint", tags=["your-model"])
```

Done! Your endpoint is now available at `/your-endpoint/predict`

## Current Models

### Fracture Detection
**Endpoint**: `/fracture/predict`

**Request**:
```bash
curl -X POST "http://localhost:5000/fracture/predict" \
  -F "image=@xray.jpg"
```

**Response**:
```json
{
  "prediction": "fracture",
  "confidence": 0.95,
  "confidence_level": "high",
  "probabilities": {
    "fracture": 0.95,
    "no_fracture": 0.05
  },
  "message": "FRACTURE DÉTECTÉE avec haute confiance (95.0%)",
  "warning": null
}
```

## Tips

- Keep model weights in `weights/` directory
- Each model is independent with its own router
- Use the base class for common functionality
- Test your endpoint at `/docs` before integrating
