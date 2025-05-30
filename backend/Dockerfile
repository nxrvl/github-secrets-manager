FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["npm", "start"]