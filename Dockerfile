FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    bash \
    openssl \
    tzdata

COPY package*.json ./
COPY bin ./bin
COPY src ./src
COPY electron ./electron
COPY website ./website
COPY *.json *.ts *.html *.css *.md .eslintrc.cjs vite.config.ts tsconfig*.json ./

RUN npm install -g openforge@latest

RUN npm install

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "dev"]
