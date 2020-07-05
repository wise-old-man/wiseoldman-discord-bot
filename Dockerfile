FROM node:12

WORKDIR /wise-old-man/discord-bot

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .
COPY wait-for-it.sh .

RUN ["chmod", "+x", "./wait-for-it.sh"]
