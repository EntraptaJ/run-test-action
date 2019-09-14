FROM mhart/alpine-node:latest
WORKDIR /app
COPY src ./src/
COPY package.json package-lock.json tsconfig.json ./
RUN npm install
RUN NODE_ENV=production npm run build
ENTRYPOINT ["node", "/app/lib/index.js"]