FROM node:20-slim

WORKDIR /app

COPY client ./client
COPY tests ./tests
COPY docs/examples ./docs/examples

RUN chmod +x /app/client/src/cli.js

ENTRYPOINT ["node", "/app/tests/smoke.js"]