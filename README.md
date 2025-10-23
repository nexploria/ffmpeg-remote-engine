# 🎬 FFmpeg Render Engine

Service Node.js optimisé qui expose une API REST pour effectuer des rendus vidéo via FFmpeg natif. Conçu pour être déployé sur **Render.com** avec Docker.

## ✨ Fonctionnalités

- ✅ **FFmpeg natif** : Compilation optimisée pour des performances maximales
- ✅ **API REST simple** : Endpoints clairs et documentés
- ✅ **Upload automatique** : Vidéos uploadées sur Supabase Storage
- ✅ **Docker ready** : Déploiement facile avec Docker/Docker Compose
- ✅ **Sous-titres** : Support des fichiers SRT
- ✅ **Sécurisé** : Authentification par API key
- ✅ **Logs détaillés** : Suivi de la progression FFmpeg

## 🚀 Démarrage rapide (5 minutes)

### Prérequis

- Docker et Docker Compose installés
- Compte Supabase (gratuit sur supabase.com)

### Installation

1. **Clonez ou téléchargez ce repo**

2. **Créez un fichier `.env`** (copiez `.env.example`) :

```bash
API_KEY=change-me-to-a-secure-random-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_BUCKET=renders
PORT=8080
```

3. **Démarrez le service** :

```bash
docker-compose up --build
```

4. **Testez** :

```bash
# Health check
curl http://localhost:8080/health

# Probe FFmpeg
curl -X POST http://localhost:8080/probe \
  -H "x-api-key: change-me-to-a-secure-random-key"
```

## 📡 API Documentation

### `GET /health`

Vérifie l'état du service.

**Réponse** :
```json
{"ok": true}
```

---

### `POST /probe`

Teste FFmpeg et retourne sa version.

**Headers** :
```
x-api-key: your-api-key
```

**Réponse** :
```json
{
  "ok": true,
  "out": "ffmpeg version 4.4.2-0ubuntu0.22.04.1..."
}
```

---

### `POST /render`

Lance un rendu vidéo complet (images → vidéo avec audio et sous-titres).

**Headers** :
```
Content-Type: application/json
x-api-key: your-api-key
```

**Body** :
```json
{
  "images": [
    "https://picsum.photos/1920/1080?random=1",
    "https://picsum.photos/1920/1080?random=2",
    "https://picsum.photos/1920/1080?random=3"
  ],
  "voiceover": "https://example.com/audio.mp3",
  "subtitles": "https://example.com/subs.srt",
  "imageDuration": 3,
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "outputName": "my-video.mp4"
}
```

**Paramètres** :

| Champ | Type | Obligatoire | Défaut | Description |
|-------|------|-------------|--------|-------------|
| `images` | `string[]` | ✅ | - | URLs des images à assembler |
| `voiceover` | `string` | ✅ | - | URL de l'audio (MP3 recommandé) |
| `subtitles` | `string` | ❌ | - | URL du fichier SRT |
| `imageDuration` | `number` | ❌ | `3` | Durée de chaque image (secondes) |
| `fps` | `number` | ❌ | `30` | Frames par seconde |
| `width` | `number` | ❌ | `1920` | Largeur de la vidéo |
| `height` | `number` | ❌ | `1080` | Hauteur de la vidéo |
| `outputName` | `string` | ❌ | `render-{timestamp}.mp4` | Nom du fichier final |

**Réponse succès** :
```json
{
  "ok": true,
  "url": "https://.../storage/v1/object/public/renders/my-video.mp4",
  "bytes": 1234567
}
```

**Réponse erreur** :
```json
{
  "ok": false,
  "error": "images[] required"
}
```

---

## 🌐 Déploiement sur Render.com

**Guide complet** : Consultez [DEPLOY.md](./DEPLOY.md) pour déployer en 10 minutes.

**Résumé rapide** :

1. Poussez ce code sur GitHub
2. Créez un **Web Service** sur Render.com
3. Sélectionnez **Docker** comme environnement
4. Configurez les variables d'environnement
5. Déployez !

Vous obtiendrez une URL publique :
```
https://ffmpeg-render-engine.onrender.com
```

---

## 🔌 Intégration avec Lovable

Consultez [INTEGRATION.md](./INTEGRATION.md) pour intégrer ce moteur dans votre app Lovable.

**Exemple rapide** :

```typescript
const result = await fetch('https://ffmpeg-render-engine.onrender.com/render', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key',
  },
  body: JSON.stringify({
    images: ['https://...', 'https://...'],
    voiceover: 'https://...',
    imageDuration: 3,
  }),
});

const data = await result.json();
console.log('Video URL:', data.url);
```

---

## 🛠️ Stack technique

- **Runtime** : Node.js 18
- **Framework** : Express.js
- **Video processing** : FFmpeg natif (compilé)
- **Storage** : Supabase Storage
- **Containerization** : Docker
- **Deployment** : Render.com (recommandé)

---

## 🔐 Sécurité

### API Key

- Changez `API_KEY` en production
- Générez une clé sécurisée : `openssl rand -hex 32`
- Ne commitez **jamais** votre `.env`

### CORS

Par défaut, CORS est ouvert (`origin: '*'`). En production, restreignez aux origines autorisées dans `server.js` :

```javascript
app.use(cors({ 
  origin: 'https://your-app.lovable.app',
}));
```

### Variables sensibles

- `SUPABASE_KEY` : Utilisez l'**anon key**, pas la service role key
- `API_KEY` : Utilisez les secrets de Render.com ou Lovable Cloud

---

## 📊 Performances

### Plan Free de Render.com

- ⚠️ Cold start après 15 min d'inactivité (~30s)
- ✅ Gratuit mais limité à 750h/mois
- ✅ Suffisant pour prototypes

### Plan Starter ($7/mois)

- ✅ Pas de cold start
- ✅ Timeouts plus longs (>60s)
- ✅ Plus de CPU/RAM
- ✅ Recommandé pour production

---

## 🧪 Tests

### Local

```bash
# Démarrer
docker-compose up

# Tester
curl -X POST http://localhost:8080/render \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"images":["https://picsum.photos/1920/1080"],"voiceover":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}'
```

### Production

```bash
# Health check
curl https://ffmpeg-render-engine.onrender.com/health

# Render test
curl -X POST https://ffmpeg-render-engine.onrender.com/render \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"images":["https://picsum.photos/1920/1080"],"voiceover":"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"}'
```

---

## 🐛 Troubleshooting

### Le conteneur ne démarre pas

- Vérifiez les logs : `docker-compose logs -f`
- Vérifiez que `SUPABASE_URL` et `SUPABASE_KEY` sont corrects

### Erreur 401 Unauthorized

- Vérifiez que l'en-tête `x-api-key` correspond à `API_KEY`

### Timeout sur les rendus

- Plan Free : Maximum 60s par requête
- Solution : Passez au plan Starter ou optimisez vos vidéos

### Vidéo pas uploadée sur Supabase

- Vérifiez que le bucket `renders` existe
- Vérifiez les permissions du bucket (public ou RLS)

---

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** : Guide pas à pas pour démarrer
- **[DEPLOY.md](./DEPLOY.md)** : Déploiement sur Render.com
- **[INTEGRATION.md](./INTEGRATION.md)** : Intégrer avec votre app Lovable

---

## 📝 Licence

MIT

---

## 🙏 Contributions

Les contributions sont les bienvenues ! Ouvrez une issue ou une PR.

---

## 💬 Support

Besoin d'aide ? Ouvrez une issue sur GitHub ou consultez la documentation complète.
