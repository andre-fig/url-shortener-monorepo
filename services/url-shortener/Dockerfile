# Usar apenas a imagem base do Node.js
FROM node:20 AS development
WORKDIR /app

# Copiar o yarn.lock da raiz do monorepo e o package.json específico do serviço
COPY yarn.lock ./
COPY ./services/url-shortener/package.json ./

# Instalar dependências de desenvolvimento
RUN yarn install --frozen-lockfile

# Copiar o restante do código do serviço para o contêiner
COPY ./services/url-shortener ./

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação em modo de desenvolvimento
CMD ["yarn", "start:dev"]
