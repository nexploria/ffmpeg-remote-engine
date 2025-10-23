# 🚀 Déploiement sur Render.com

Ce guide vous montre comment déployer votre moteur FFmpeg sur Render.com en **10 minutes chrono**.

## Prérequis

1. **Compte Render.com** (gratuit) : [render.com](https://render.com)
2. **Compte GitHub** : pour héberger le code
3. **Projet Supabase** : pour stocker les vidéos rendues

## Étape 1 : Pousser le code sur GitHub (2 min)

### Option A : Depuis Lovable (recommandé)

1. Dans Lovable, cliquez sur **GitHub** (en haut à droite)
2. Cliquez **Connect to GitHub**
3. Autorisez l'application Lovable
4. Créez un nouveau repo nommé : `ffmpeg-render-engine`

Le code du dossier `render-engine/` sera automatiquement poussé.

### Option B : Manuellement

```bash
# Créez un nouveau repo sur GitHub nommé "ffmpeg-render-engine"

cd render-engine/

git init
git add .
git commit -m "Initial commit - FFmpeg Render Engine"
git remote add origin https://github.com/VOTRE-USERNAME/ffmpeg-render-engine.git
git push -u origin main
```

## Étape 2 : Créer le service sur Render.com (5 min)

### 1. Nouveau Web Service

1. Connectez-vous sur [dashboard.render.com](https://dashboard.render.com)
2. Cliquez **New +** → **Web Service**
3. Sélectionnez **Connect a repository**
4. Autorisez Render à accéder à votre GitHub
5. Sélectionnez le repo `ffmpeg-render-engine`

### 2. Configuration du service

Remplissez les champs suivants :

| Champ | Valeur |
|-------|--------|
| **Name** | `ffmpeg-render-engine` |
| **Region** | Frankfurt (Europe) ou le plus proche |
| **Branch** | `main` (ou `master`) |
| **Runtime** | `Docker` |
| **Instance Type** | Free (ou Starter pour de meilleures performances) |
| **Docker Command** | *(laisser vide, utilise CMD du Dockerfile)* |

### 3. Variables d'environnement

Dans la section **Environment Variables**, ajoutez :

| Key | Value |
|-----|-------|
| `API_KEY` | `votre-cle-secrete-unique-changez-moi` |
| `SUPABASE_URL` | `https://votreprojet.supabase.co` |
| `SUPABASE_KEY` | Votre Supabase **anon key** |
| `SUPABASE_BUCKET` | `renders` |
| `PORT` | `8080` |

> 💡 **Où trouver les clés Supabase ?**
> - Allez sur votre projet Supabase
> - Settings → API
> - Copiez `Project URL` et `anon public key`

### 4. Options avancées (optionnel)

- **Auto-Deploy** : ✅ Activé (déploie à chaque push sur main)
- **Health Check Path** : `/health`

### 5. Créer le service

Cliquez **Create Web Service**

⏱️ Le déploiement prend 5-10 minutes (Docker build + FFmpeg installation)

## Étape 3 : Récupérer l'URL publique (1 min)

Une fois déployé, Render génère une URL publique :

```
https://ffmpeg-render-engine.onrender.com
```

### Testez le service

```bash
# Health check
curl https://ffmpeg-render-engine.onrender.com/health

# Probe FFmpeg
curl -X POST https://ffmpeg-render-engine.onrender.com/probe \
  -H "x-api-key: VOTRE_API_KEY"
```

## Étape 4 : Configurer Lovable pour utiliser l'URL distante (2 min)

### Option 1 : Via les secrets Lovable (recommandé)

Dans votre projet Lovable, ajoutez un secret :

1. Ouvrez le backend Lovable Cloud
2. Ajoutez un nouveau secret :
   - **Nom** : `VITE_RENDER_URL`
   - **Valeur** : `https://ffmpeg-render-engine.onrender.com`

### Option 2 : Hardcodé (pour tests rapides)

Dans `src/utils/renderApi.ts`, remplacez :

```typescript
const RENDER_ENGINE_URL = import.meta.env.VITE_RENDER_URL || 'http://localhost:8080';
```

par :

```typescript
const RENDER_ENGINE_URL = 'https://ffmpeg-render-engine.onrender.com';
```

## 🎉 C'est terminé !

Votre moteur FFmpeg est maintenant :
- ✅ Hébergé sur Render.com
- ✅ Déployé automatiquement à chaque push GitHub
- ✅ Accessible depuis votre app Lovable
- ✅ Scalable et sécurisé

## 📊 Monitoring

### Logs en temps réel

1. Allez sur votre dashboard Render.com
2. Cliquez sur `ffmpeg-render-engine`
3. Onglet **Logs**

### Métriques

- CPU/RAM usage
- Nombre de requêtes
- Temps de réponse

## 🔧 Troubleshooting

### Service crashe au démarrage

**Symptôme** : "Application failed to respond"

**Solutions** :
1. Vérifiez les variables d'environnement (SUPABASE_URL et SUPABASE_KEY obligatoires)
2. Vérifiez les logs pour voir l'erreur exacte
3. Testez localement avec Docker pour reproduire l'erreur

### Timeout sur les rendus longs

**Symptôme** : 502 Bad Gateway après 60 secondes

**Solution** :
- Plan Free : Maximum 60s par requête
- Passez à un plan Starter pour des timeouts plus longs
- Optimisez vos vidéos (résolution, durée)

### Erreur 401 Unauthorized

**Symptôme** : `{"ok":false,"error":"unauthorized"}`

**Solution** :
- Vérifiez que l'en-tête `x-api-key` est correct
- Vérifiez que la variable `API_KEY` est bien définie sur Render

### Vidéos pas uploadées sur Supabase

**Symptôme** : Rendu réussi mais pas de fichier dans Supabase Storage

**Solution** :
1. Vérifiez que le bucket `renders` existe dans Supabase
2. Vérifiez les permissions du bucket (public ou RLS)
3. Vérifiez la `SUPABASE_KEY` (doit être l'anon key, pas la service role key)

## 🔐 Sécurité

### Changez votre API_KEY régulièrement

```bash
# Générer une nouvelle clé sécurisée
openssl rand -hex 32
```

Mettez à jour la variable `API_KEY` sur Render et dans votre app Lovable.

### Limitez les origines CORS (production)

Dans `server.js`, remplacez `origin: '*'` par votre domaine :

```javascript
app.use(cors({ 
  origin: 'https://votre-app.lovable.app',
  // ...
}));
```

## 📈 Scaling

### Performance avec le plan Free

- ⚠️ Le service s'endort après 15 min d'inactivité
- Premier appel prend ~30s (cold start)
- Ensuite : performances normales

### Upgrade vers Starter ($7/mois)

- ✅ Pas de cold start
- ✅ Timeouts plus longs
- ✅ Plus de CPU/RAM
- ✅ Meilleur pour la production

## 🎬 Prochaines étapes

1. Testez un rendu complet depuis votre app Lovable
2. Configurez les webhooks pour notifications (optionnel)
3. Ajoutez du monitoring avec Sentry ou LogRocket (optionnel)

Besoin d'aide ? Consultez [INTEGRATION.md](./INTEGRATION.md) pour intégrer avec votre app.
