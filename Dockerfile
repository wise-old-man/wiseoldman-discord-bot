FROM node:16.14.0

WORKDIR /wise-old-man/discord-bot

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json ./
RUN npm install -s

COPY . .
COPY wait-for-it.sh .

RUN npm run build

CMD ["npm", "start"]
