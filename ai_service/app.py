"""
Flask API pour la détection de fractures osseuses
Utilise un modèle EfficientNet-B0 entraîné sur des radiographies
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Permettre les requêtes depuis Spring Boot

# Configuration
MODEL_PATH = 'fracture_model_v2.pt'
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
CLASS_NAMES = ['fracture', 'no_fracture']

# Charger le modèle au démarrage
print(f"🔄 Chargement du modèle depuis {MODEL_PATH}...")
try:
    model = torch.jit.load(MODEL_PATH, map_location=DEVICE)
    model.eval()
    print(f"✅ Modèle chargé avec succès sur {DEVICE}")
except Exception as e:
    print(f"❌ Erreur lors du chargement du modèle: {e}")
    model = None

# Transformations (identiques à l'entraînement)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def get_confidence_level(confidence):
    """Retourne le niveau de confiance"""
    if confidence >= 0.80:
        return "high"
    elif confidence >= 0.60:
        return "medium"
    else:
        return "low"

def get_message(prediction, confidence):
    """Génère un message descriptif"""
    if prediction == "fracture":
        if confidence >= 0.80:
            return f"FRACTURE DÉTECTÉE avec haute confiance ({confidence*100:.1f}%)"
        elif confidence >= 0.60:
            return f"FRACTURE PROBABLE ({confidence*100:.1f}%) - Vérification recommandée"
        else:
            return f"FRACTURE POSSIBLE ({confidence*100:.1f}%) - Résultat incertain, examen complémentaire nécessaire"
    else:
        if confidence >= 0.80:
            return f"PAS DE FRACTURE ({confidence*100:.1f}%)"
        elif confidence >= 0.60:
            return f"PROBABLEMENT PAS DE FRACTURE ({confidence*100:.1f}%) - Vérification recommandée"
        else:
            return f"RÉSULTAT INCERTAIN ({confidence*100:.1f}%) - Examen complémentaire nécessaire"

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de santé pour vérifier que le service fonctionne"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'device': str(DEVICE)
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint principal pour la prédiction
    Reçoit une image et retourne la prédiction de fracture
    """
    if model is None:
        return jsonify({'error': 'Modèle non chargé'}), 500
    
    # Vérifier qu'une image est présente
    if 'image' not in request.files:
        return jsonify({'error': 'Aucune image fournie'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400
    
    try:
        # Lire et prétraiter l'image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        
        # Appliquer les transformations
        img_tensor = transform(img).unsqueeze(0).to(DEVICE)
        
        # Prédiction
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = F.softmax(outputs, dim=1)[0]
        
        # Extraire les probabilités
        prob_fracture = probabilities[0].item()
        prob_no_fracture = probabilities[1].item()
        
        # Déterminer la prédiction
        predicted_class = CLASS_NAMES[probabilities.argmax().item()]
        confidence = probabilities.max().item()
        
        # Générer le message et le niveau de confiance
        message = get_message(predicted_class, confidence)
        confidence_level = get_confidence_level(confidence)
        
        # Préparer la réponse
        response = {
            'prediction': predicted_class,
            'confidence': round(confidence, 3),
            'confidence_level': confidence_level,
            'probabilities': {
                'fracture': round(prob_fracture, 3),
                'no_fracture': round(prob_no_fracture, 3)
            },
            'message': message,
            'warning': None
        }
        
        # Ajouter un warning si confiance faible
        if confidence < 0.60:
            response['warning'] = f"⚠️ Confiance faible ({confidence*100:.1f}%) — Résultat incertain ! Examen complémentaire recommandé."
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': f'Erreur lors de la prédiction: {str(e)}'}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 Service d'Analyse de Fractures - API Flask")
    print("="*60)
    print(f"📍 Endpoint: http://localhost:5000/predict")
    print(f"🔍 Health check: http://localhost:5000/health")
    print(f"🖥️  Device: {DEVICE}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
