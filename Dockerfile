FROM node:16.14.0 as base

WORKDIR /wise-old-man/discord-bot

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .
COPY wait-for-it.sh .

RUN npm run build

# production image
FROM base as production
# Creates a non-root user with an explicit UID and adds permission to access the /wise-old-man/discord-bot folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /wise-old-man/discord-bot
USER appuser


CMD ["npm", "start"]
