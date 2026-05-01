# Template for adding new models
# Copy this file and rename it to your model name

from fastapi import APIRouter, File, UploadFile, HTTPException
from .base import BaseModel

router = APIRouter()

class YourModel(BaseModel):
    def __init__(self):
        self.device = "cpu"
        super().__init__('weights/your_model.pt')
    
    def load_model(self):
        try:
            # Load your model here
            # self.model = torch.load(self.model_path)
            print(f"Model loaded from {self.model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    async def predict(self, image: UploadFile):
        if not self.is_loaded():
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        img_bytes = await image.read()
        # Your inference logic here
        
        return {"prediction": "result"}

model = YourModel()

@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    return await model.predict(image)

@router.get("/health")
def health():
    return {"status": "ok" if model.is_loaded() else "error"}
