# Stage 1: Build the app
FROM node:18 AS builder
WORKDIR /app

# Copiar o yarn.lock da raiz do monorepo e o package.json específico do serviço
COPY ../../yarn.lock ./
COPY ./services/url-shortener/package.json ./

# Instalar dependências de produção e desenvolvimento usando Yarn
RUN yarn install --frozen-lockfile

# Instalar o NestJS CLI globalmente
RUN yarn global add @nestjs/cli

# Copiar o restante do código do serviço para o contêiner
COPY ./services/url-shortener ./

# Compilar o projeto diretamente no contexto do serviço
RUN yarn run build

# Stage 2: Run the app
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar os arquivos do estágio de build
COPY --from=builder /app ./

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["yarn", "start:prod"]
