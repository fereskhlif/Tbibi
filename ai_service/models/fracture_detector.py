from fastapi import APIRouter, File, UploadFile, HTTPException
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
from .base import BaseModel

router = APIRouter()

class FractureDetector(BaseModel):
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.class_names = ['fracture', 'no_fracture']
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        super().__init__('weights/fracture_model_v2.pt')
    
    def load_model(self):
        try:
            self.model = torch.jit.load(self.model_path, map_location=self.device)
            self.model.eval()
            print(f"Fracture model loaded on {self.device}")
        except Exception as e:
            print(f"Error loading fracture model: {e}")
            self.model = None
    
    async def predict(self, image: UploadFile):
        if not self.is_loaded():
            raise HTTPException(status_code=500, detail="Modèle non chargé")
        
        img_bytes = await image.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        img_tensor = self.transform(img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(img_tensor)
            probabilities = F.softmax(outputs, dim=1)[0]
        
        prob_fracture = probabilities[0].item()
        prob_no_fracture = probabilities[1].item()
        predicted_class = self.class_names[probabilities.argmax().item()]
        confidence = probabilities.max().item()
        
        return {
            "prediction": predicted_class,
            "confidence": round(confidence, 3),
            "confidence_level": self._get_confidence_level(confidence),
            "probabilities": {
                "fracture": round(prob_fracture, 3),
                "no_fracture": round(prob_no_fracture, 3)
            },
            "message": self._get_message(predicted_class, confidence),
            "warning": self._get_warning(confidence)
        }
    
    def _get_confidence_level(self, confidence):
        if confidence >= 0.80:
            return "high"
        elif confidence >= 0.60:
            return "medium"
        return "low"
    
    def _get_message(self, prediction, confidence):
        pct = confidence * 100
        if prediction == "fracture":
            if confidence >= 0.80:
                return f"FRACTURE DÉTECTÉE avec haute confiance ({pct:.1f}%)"
            elif confidence >= 0.60:
                return f"FRACTURE PROBABLE ({pct:.1f}%) - Vérification recommandée"
            return f"FRACTURE POSSIBLE ({pct:.1f}%) - Résultat incertain, examen complémentaire nécessaire"
        
        if confidence >= 0.80:
            return f"PAS DE FRACTURE ({pct:.1f}%)"
        elif confidence >= 0.60:
            return f"PROBABLEMENT PAS DE FRACTURE ({pct:.1f}%) - Vérification recommandée"
        return f"RÉSULTAT INCERTAIN ({pct:.1f}%) - Examen complémentaire nécessaire"
    
    def _get_warning(self, confidence):
        if confidence < 0.60:
            return f"⚠️ Confiance faible ({confidence*100:.1f}%) — Résultat incertain ! Examen complémentaire recommandé."
        return None

detector = FractureDetector()

@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="Nom de fichier vide")
    return await detector.predict(image)

@router.get("/health")
def health():
    return {
        "status": "ok" if detector.is_loaded() else "error",
        "model_loaded": detector.is_loaded(),
        "device": str(detector.device)
    }
