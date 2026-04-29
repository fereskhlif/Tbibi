# 🏥 Service d'Analyse de Fractures - API Flask

Service Python Flask pour la détection automatique de fractures osseuses sur des radiographies médicales.

## 🚀 Installation

1. **Installer les dépendances:**
```bash
cd ai_service
pip install -r requirements.txt
```

2. **Vérifier que le modèle est présent:**
```bash
ls fracture_model_v2.pt
```

## ▶️ Démarrage

```bash
python app.py
```

Le service démarre sur `http://localhost:5000`

## 📡 Endpoints

### 1. Health Check
```bash
GET http://localhost:5000/health
```

**Réponse:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda"
}
```

### 2. Prédiction
```bash
POST http://localhost:5000/predict
Content-Type: multipart/form-data
Body: image=@radio.jpg
```

**Réponse:**
```json
{
  "prediction": "no_fracture",
  "confidence": 0.633,
  "confidence_level": "medium",
  "probabilities": {
    "fracture": 0.367,
    "no_fracture": 0.633
  },
  "message": "PROBABLEMENT PAS DE FRACTURE (63.3%) - Vérification recommandée",
  "warning": null
}
```

## 🧪 Test avec curl

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@test_image.jpg"
```

## 📊 Niveaux de confiance

- **High (>80%)**: Résultat fiable
- **Medium (60-80%)**: Vérification recommandée
- **Low (<60%)**: Résultat incertain, examen complémentaire nécessaire

## 🔧 Configuration

- **Port**: 5000 (modifiable dans `app.py`)
- **Device**: Auto-détection GPU/CPU
- **Modèle**: EfficientNet-B0 (TorchScript)
- **Input**: Images RGB 224x224
- **Classes**: fracture, no_fracture

## 🐛 Dépannage

**Erreur "Modèle non chargé":**
- Vérifier que `fracture_model_v2.pt` existe dans le dossier
- Vérifier la version de PyTorch (2.1.0)

**Erreur CUDA:**
- Le service fonctionne aussi sur CPU
- Vérifier l'installation de PyTorch avec support CUDA si GPU disponible

## 📝 Notes

- Le service utilise CORS pour permettre les requêtes depuis Spring Boot
- Les images sont automatiquement redimensionnées à 224x224
- La normalisation ImageNet est appliquée automatiquement
