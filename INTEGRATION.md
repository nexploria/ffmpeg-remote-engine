# 🔌 Intégration avec votre application Lovable

Ce guide explique comment intégrer le moteur FFmpeg distant dans votre application Lovable.

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│   App Lovable   │────────▶│  Render Engine (API) │────────▶│   Supabase      │
│   (Frontend)    │  POST   │  (FFmpeg + Node.js)  │  Upload │   Storage       │
└─────────────────┘         └──────────────────────┘         └─────────────────┘
     │                               │
     │                               │
     └───────────────────────────────┘
           Récupère l'URL finale
```

## Étape 1 : Configuration de l'URL du moteur

### Option A : Via les secrets Lovable Cloud (recommandé)

1. Ouvrez votre backend Lovable Cloud
2. Allez dans **Secrets**
3. Ajoutez un nouveau secret :
   - **Nom** : `VITE_RENDER_URL`
   - **Valeur** : `https://ffmpeg-render-engine.onrender.com`

4. Le secret sera automatiquement disponible via :
```typescript
const RENDER_ENGINE_URL = import.meta.env.VITE_RENDER_URL;
```

### Option B : Configuration locale (.env)

Pour le développement local, créez un fichier `.env` à la racine de votre projet Lovable :

```bash
VITE_RENDER_URL=http://localhost:8080
VITE_RENDER_KEY=votre-api-key
```

## Étape 2 : Créer l'utilitaire d'API

Créez ou modifiez `src/utils/renderApi.ts` :

```typescript
const RENDER_ENGINE_URL = import.meta.env.VITE_RENDER_URL || 'http://localhost:8080';
const RENDER_API_KEY = import.meta.env.VITE_RENDER_KEY || '';

interface RenderOptions {
  images: string[];
  voiceover: string;
  subtitles?: string;
  imageDuration?: number;
  fps?: number;
  width?: number;
  height?: number;
  outputName?: string;
}

export async function renderVideo(options: RenderOptions) {
  const response = await fetch(`${RENDER_ENGINE_URL}/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': RENDER_API_KEY,
    },
    body: JSON.stringify(options),
  });

  return response.json();
}
```

Consultez la documentation complète dans le fichier pour tous les détails.

## Prochaines étapes

1. Testez l'intégration localement
2. Déployez sur Render.com
3. Configurez les secrets dans Lovable Cloud
4. Testez en production

Pour plus de détails, consultez [README.md](./README.md) et [DEPLOY.md](./DEPLOY.md).
