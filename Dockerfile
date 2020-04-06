FROM node:12-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

# COPY App Source Code
COPY . .

EXPOSE 8080

CMD ["npm","start"]