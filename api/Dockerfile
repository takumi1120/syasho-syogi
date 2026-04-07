FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=prisma/syasho-syogi/schema.prisma
RUN npx prisma generate --schema=prisma/gobblet-gobblers/schema.prisma
RUN npm run build && cp -r src/generated dist/generated

EXPOSE 3000

CMD ["npm", "run", "start"]
