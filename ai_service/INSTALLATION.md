# 🚀 Guide d'Installation - Service IA de Détection de Fractures

## 📋 Prérequis

- Python 3.12.10 (ou version compatible)
- pip (gestionnaire de paquets Python)
- 2-3 GB d'espace disque (pour PyTorch)

## 🔧 Installation

### Étape 1: Installer les dépendances Python

Ouvrir un terminal dans le dossier `ai_service/` et exécuter:

```bash
pip install -r requirements.txt
```

**Note**: L'installation de PyTorch peut prendre quelques minutes.

### Étape 2: Vérifier le modèle

Assurez-vous que le fichier `fracture_model.pt` est présent dans le dossier `ai_service/`.

```bash
dir fracture_model.pt
```

Si le fichier est absent, copiez-le depuis votre environnement d'entraînement.

### Étape 3: Tester le service

```bash
python test_api.py
```

Vous devriez voir:
```
✅ Service opérationnel
   - Modèle chargé: True
   - Device: cpu (ou cuda si GPU disponible)
```

## ▶️ Démarrage

### Option 1: Script Windows (Recommandé)

Double-cliquer sur `start.bat` ou exécuter:

```bash
start.bat
```

### Option 2: Commande Python

```bash
python app.py
```

Le service démarre sur `http://localhost:5000`

## 🧪 Test avec une image

```bash
python test_api.py chemin/vers/radio.jpg
```

Exemple de sortie:
```
✅ Prédiction réussie:
   - Prédiction: no_fracture
   - Confiance: 63.3%
   - Niveau: medium
   - Message: PROBABLEMENT PAS DE FRACTURE (63.3%) - Vérification recommandée
   - Probabilités:
      • fracture: 36.7%
      • no_fracture: 63.3%
```

## 🔗 Intégration avec Spring Boot

### Étape 1: Démarrer le service Python

```bash
cd ai_service
python app.py
```

### Étape 2: Compiler le backend Spring Boot

```bash
cd backend
./mvnw clean compile
```

### Étape 3: Démarrer Spring Boot

```bash
./mvnw spring-boot:run
```

### Étape 4: Tester l'intégration

Ouvrir le frontend Angular et:
1. Aller dans "Medical Picture Analysis"
2. Cliquer sur "Analyze with AI" sur une image
3. Voir les résultats de l'analyse

## 🐛 Dépannage

### Erreur: "Module 'torch' not found"

```bash
pip install torch torchvision
```

### Erreur: "Modèle non chargé"

Vérifier que `fracture_model.pt` existe:
```bash
dir fracture_model.pt
```

### Erreur: "Port 5000 already in use"

Changer le port dans `app.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

Et mettre à jour l'URL dans `FractureAnalysisService.java`:
```java
private static final String AI_SERVICE_URL = "http://localhost:5001/predict";
```

### Service IA non disponible depuis Spring Boot

Vérifier que:
1. Le service Python est démarré (`python app.py`)
2. Le port 5000 est accessible
3. Pas de firewall bloquant

Tester manuellement:
```bash
curl http://localhost:5000/health
```

## 📊 Performance

- **CPU**: ~2-3 secondes par image
- **GPU**: ~0.5-1 seconde par image

Pour utiliser le GPU, installer PyTorch avec support CUDA:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 🔒 Sécurité

En production:
- Désactiver le mode debug: `app.run(debug=False)`
- Ajouter une authentification
- Limiter les tailles de fichiers
- Utiliser HTTPS

## 📝 Logs

Les logs du service sont affichés dans la console. Pour les sauvegarder:

```bash
python app.py > service.log 2>&1
```

## ✅ Checklist de démarrage

- [ ] Python 3.12+ installé
- [ ] Dépendances installées (`pip install -r requirements.txt`)
- [ ] Modèle `fracture_model.pt` présent
- [ ] Service Python démarré (`python app.py`)
- [ ] Health check OK (`http://localhost:5000/health`)
- [ ] Backend Spring Boot démarré
- [ ] Frontend Angular accessible

## 🆘 Support

En cas de problème:
1. Vérifier les logs du service Python
2. Vérifier les logs Spring Boot
3. Tester manuellement avec `test_api.py`
4. Vérifier la console du navigateur (F12)
