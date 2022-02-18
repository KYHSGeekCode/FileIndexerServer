FROM node:erbium-alpine3.14

WORKDIR /app

COPY package*.json ./
# Install production dependencies.
RUN npm install typescript
RUN npm install -g ts-node
RUN npm install --only=production
RUN npm build

COPY . .

ENV PORT 8080

CMD [ "npm", "start", "prod" ]
