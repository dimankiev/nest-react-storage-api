FROM node:18-alpine
LABEL authors="dimankiev"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prebuild

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]