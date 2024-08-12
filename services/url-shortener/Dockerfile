# Usar apenas a imagem base do Node.js
FROM node:20 AS development
WORKDIR /app

# Copiar o yarn.lock da raiz do monorepo e o package.json específico do serviço
COPY ../../yarn.lock ./
COPY ./services/url-shortener/package.json ./

# Instalar dependências de desenvolvimento
RUN yarn install

# Instalar o NestJS CLI globalmente
RUN yarn global add @nestjs/cli

# Copiar o restante do código do serviço para o contêiner
COPY ./services/url-shortener ./

# Expor a porta
EXPOSE 3000

# Comando para executar as migrações e iniciar a aplicação em modo de desenvolvimento
CMD ["sh", "-c", "yarn migration:run && yarn start:dev"]
