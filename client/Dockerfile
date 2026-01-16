FROM node:20-slim

WORKDIR /app

COPY client/package.json ./
RUN npm install --omit=dev

COPY client/src ./src
COPY docs/examples ./docs/examples

RUN ln -s /app/src/cli.js /usr/local/bin/action-client
RUN chmod +x /app/src/cli.js

ENTRYPOINT ["action-client"]
