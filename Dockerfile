FROM node:8.12-alpine
WORKDIR /app
COPY package.json yarn.lock ./
COPY dist ./dist
RUN yarn install --production
EXPOSE 3000
CMD ["node", "dist/index.js"]