FROM node:16-alpine
# FROM node:16

WORKDIR /app/
COPY . .
RUN npm install

ENV NODE_ENV=production
RUN npm run build

CMD npm run start
