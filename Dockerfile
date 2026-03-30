FROM node:20-alpine AS syacho-api-builder

WORKDIR /app/api

COPY api/package*.json ./
RUN npm ci

COPY api ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS gobblet-api-builder

WORKDIR /app/apps/Gobblet-gobblers/api

COPY apps/Gobblet-gobblers/api/package*.json ./
RUN npm ci

COPY apps/Gobblet-gobblers/api ./

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS syacho-web-builder

WORKDIR /app/web

ARG SYACHO_VITE_API_URL=/api
ARG SYACHO_VITE_BASE_PATH=/

ENV VITE_API_URL=$SYACHO_VITE_API_URL
ENV VITE_BASE_PATH=$SYACHO_VITE_BASE_PATH

COPY web/package*.json ./
RUN npm ci

COPY web ./

RUN npm run build

FROM node:20-alpine AS gobblet-web-builder

WORKDIR /app/apps/Gobblet-gobblers/web

ARG GOBBLET_VITE_API_URL=/gobblet/api
ARG GOBBLET_VITE_BASE_PATH=/gobblet/

ENV VITE_API_URL=$GOBBLET_VITE_API_URL
ENV VITE_BASE_PATH=$GOBBLET_VITE_BASE_PATH

COPY apps/Gobblet-gobblers/web/package*.json ./
RUN npm ci

COPY apps/Gobblet-gobblers/web ./

RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=syacho-api-builder /app/api/package.json ./api/package.json
COPY --from=syacho-api-builder /app/api/node_modules ./api/node_modules
COPY --from=syacho-api-builder /app/api/dist ./api/dist

COPY --from=gobblet-api-builder /app/apps/Gobblet-gobblers/api/package.json ./apps/Gobblet-gobblers/api/package.json
COPY --from=gobblet-api-builder /app/apps/Gobblet-gobblers/api/node_modules ./apps/Gobblet-gobblers/api/node_modules
COPY --from=gobblet-api-builder /app/apps/Gobblet-gobblers/api/dist ./apps/Gobblet-gobblers/api/dist

COPY --from=syacho-web-builder /app/web/dist ./web/dist
COPY --from=gobblet-web-builder /app/apps/Gobblet-gobblers/web/dist ./apps/Gobblet-gobblers/web/dist

EXPOSE 8080

CMD ["node", "api/dist/unified-server.js"]
