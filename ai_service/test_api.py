"""
Script de test pour l'API Flask de détection de fractures
"""

import requests
import sys

def test_health():
    """Test du endpoint health"""
    print("🔍 Test du health check...")
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service opérationnel")
            print(f"   - Modèle chargé: {data['model_loaded']}")
            print(f"   - Device: {data['device']}")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Impossible de se connecter au service: {e}")
        return False

def test_predict(image_path):
    """Test du endpoint predict"""
    print(f"\n🔬 Test de prédiction avec l'image: {image_path}")
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post('http://localhost:5000/predict', files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Prédiction réussie:")
            print(f"   - Prédiction: {data['prediction']}")
            print(f"   - Confiance: {data['confidence']*100:.1f}%")
            print(f"   - Niveau: {data['confidence_level']}")
            print(f"   - Message: {data['message']}")
            if data.get('warning'):
                print(f"   - ⚠️  Warning: {data['warning']}")
            print(f"   - Probabilités:")
            for classe, prob in data['probabilities'].items():
                print(f"      • {classe}: {prob*100:.1f}%")
            return True
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"   {response.text}")
            return False
    except FileNotFoundError:
        print(f"❌ Fichier introuvable: {image_path}")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == '__main__':
    print("="*60)
    print("🧪 Test de l'API de Détection de Fractures")
    print("="*60)
    
    # Test 1: Health check
    if not test_health():
        print("\n❌ Le service n'est pas disponible. Assurez-vous qu'il est démarré:")
        print("   python app.py")
        sys.exit(1)
    
    # Test 2: Prédiction
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_predict(image_path)
    else:
        print("\n💡 Pour tester une prédiction, lancez:")
        print("   python test_api.py chemin/vers/image.jpg")
    
    print("\n" + "="*60)
