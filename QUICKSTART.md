# 🚀 FFmpeg Render Engine - Quick Start

## Démarrage local (5 minutes)

### 1. Prérequis
- Docker et Docker Compose installés
- Compte Supabase (ou créez-en un gratuitement sur supabase.com)

### 2. Configuration

Créez un fichier `.env` à la racine du projet :

```bash
# Sécurité
API_KEY=votre-cle-secrete-unique

# Supabase (récupérez ces valeurs depuis votre projet Supabase)
SUPABASE_URL=https://votreprojet.supabase.co
SUPABASE_KEY=votre-anon-key
SUPABASE_BUCKET=renders

# Port (optionnel)
PORT=8080
```

### 3. Démarrage

```bash
# Construire et démarrer
docker-compose up --build

# En arrière-plan
docker-compose up -d
```

L'API sera accessible sur `http://localhost:8080`

## 🧪 Test rapide

### Vérifier l'état
```bash
curl http://localhost:8080/health
# Réponse: {"ok":true}
```

### Vérifier FFmpeg
```bash
curl -X POST http://localhost:8080/probe \
  -H "x-api-key: votre-cle-secrete-unique"
# Réponse: Version de FFmpeg
```

### Créer une vidéo de test
```bash
curl -X POST http://localhost:8080/render \
  -H "Content-Type: application/json" \
  -H "x-api-key: votre-cle-secrete-unique" \
  -d '{
    "images": [
      "https://picsum.photos/1920/1080?random=1",
      "https://picsum.photos/1920/1080?random=2",
      "https://picsum.photos/1920/1080?random=3"
    ],
    "imageDuration": 3,
    "fps": 30,
    "width": 1920,
    "height": 1080,
    "voiceover": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "outputName": "test-video.mp4"
  }'
```

## 📊 Logs

```bash
# Voir les logs
docker-compose logs -f

# Logs d'un conteneur spécifique
docker-compose logs -f render-engine
```

## 🛑 Arrêter

```bash
docker-compose down
```

## 🌐 Déploiement sur Render.com

Consultez [DEPLOY.md](./DEPLOY.md) pour déployer sur Render.com en 10 minutes.

## 🔧 Dépannage

### Le conteneur ne démarre pas
- Vérifiez vos variables d'environnement dans `.env`
- Vérifiez que SUPABASE_URL et SUPABASE_KEY sont corrects

### Erreur 401 Unauthorized
- Vérifiez que l'en-tête `x-api-key` correspond à votre `API_KEY`

### Timeout lors du rendu
- Vidéos trop longues : augmentez le timeout dans docker-compose.yml
- Ressources insuffisantes : allouez plus de CPU/RAM à Docker

## 📚 Documentation complète

- [README.md](./README.md) - Vue d'ensemble
- [DEPLOY.md](./DEPLOY.md) - Déploiement sur Render.com
- [INTEGRATION.md](./INTEGRATION.md) - Intégration avec votre app Lovable
