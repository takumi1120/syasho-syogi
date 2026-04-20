FROM node:20-alpine AS builder-syasho

WORKDIR /app/syasho-syogi

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY syasho-syogi/package*.json ./
RUN npm ci

COPY syasho-syogi/ .
RUN npm run build


FROM node:20-alpine AS builder-gobblet

WORKDIR /app/gobblet-gobblers

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY gobblet-gobblers/package*.json ./
RUN npm ci

COPY gobblet-gobblers/ .
RUN npm run build


FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
COPY --from=builder-syasho /app/syasho-syogi/dist /usr/share/nginx/html/syasho-syogi
COPY --from=builder-gobblet /app/gobblet-gobblers/dist /usr/share/nginx/html/gobblet-gobblers

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
