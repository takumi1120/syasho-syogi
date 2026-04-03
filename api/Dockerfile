FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=prisma/syasho-syogi/schema.prisma
RUN npx prisma generate --schema=prisma/gobblet-gobblers/schema.prisma
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
