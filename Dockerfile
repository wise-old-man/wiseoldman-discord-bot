FROM node:12

WORKDIR /wise-old-man/discord-bot

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .
COPY wait-for-it.sh .

RUN npm run build
