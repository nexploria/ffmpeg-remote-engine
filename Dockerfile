FROM node:18-slim

# Install FFmpeg natif (beaucoup plus rapide que ffmpeg-static)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    tzdata \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Vérifier installation FFmpeg
RUN ffmpeg -version

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm","start"]
