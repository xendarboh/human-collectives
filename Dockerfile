# FROM node:16-alpine
FROM node:16

WORKDIR /app/
COPY . .
RUN npm install

ENV NODE_ENV=production

CMD npm run build && npm run start
