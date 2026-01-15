FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN ln -s /app/src/cli.js /usr/local/bin/action-client
RUN chmod +x /app/src/cli.js

ENTRYPOINT ["action-client"]