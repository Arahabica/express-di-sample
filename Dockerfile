FROM node:22.11.0-bullseye

WORKDIR /app/web

COPY . .

RUN npm install \
    && npm run build

CMD ["node", "dist/index.js"]
