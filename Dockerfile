FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Remove dev dependencies
RUN npm prune --production

ENV NODE_ENV=production

EXPOSE 3005

CMD ["node", "index.js"]
