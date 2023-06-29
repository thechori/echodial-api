FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Remove dev dependencies
RUN npm prune --production

ENV NODE_ENV=production

EXPOSE 3005

# This sets the env var accessible at `process.env.SECRET`
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_DATABASE=$DB_DATABASE
ENV DB_CA_CERT=$DB_CA_CERT

CMD ["node", "index.js"]
