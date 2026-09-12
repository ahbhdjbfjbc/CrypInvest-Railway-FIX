FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts --no-audit --no-fund
COPY . ./
RUN npm test && npm run test:syntax
RUN npm audit --omit=dev --audit-level=high
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]
