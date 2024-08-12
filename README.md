# URL Shortener API

## Sumário

1. [Descrição](#descrição)
2. [Funcionalidades](#funcionalidades)
3. [Pré-requisitos](#pré-requisitos)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Executando a Aplicação](#executando-a-aplicação)
   - [Usando Docker](#usando-docker)
7. [Testes](#testes)
8. [Pontos de Melhoria](#pontos-de-melhoria)
   - [Versão Enterprise do KrakenD](#versão-enterprise-do-krakend)
   - [Escalabilidade Horizontal](#escalabilidade-horizontal)
   - [Migração para OAuth](#migração-para-oauth)
9. [To-Do List](#to-do-list)
   - [Configuração Inicial do Projeto](#1-.configuração-inicial-do-projeto)
   - [Estruturação do Banco de Dados](#2-.estruturação-do-banco-de-dados)
   - [Autenticação e Autorização](#3-.autenticação-e-autorização)
   - [Implementação dos Endpoints](#4-.implementação-dos-endpoints)
   - [Redirecionamento e Contabilização de Cliques](#5-.redirecionamento-e-contabilização-de-cliques)
   - [Testes e Validações](#6-.testes-e-validações)
   - [Documentação e Observabilidade](#7-.documentação-e-observabilidade)
   - [Deploy e Infraestrutura](#8-.deploy-e-infraestrutura)
   - [Melhoria e Escalabilidade](#9-.melhoria-e-escalabilidade)
   - [Versão e Controle de Mudança](#10-.versão-e-controle-de-mudança)
   - [Boas Práticas e Qualidade de Código](#11-.boas-práticas-e-qualidade-de-código)

## Descrição

Este projeto é uma API RESTful para encurtamento de URLs, construída com Node.js utilizando o framework NestJS. A aplicação permite que usuários criem URLs encurtadas, gerenciem essas URLs (listar, atualizar, excluir) e acompanhem o número de cliques em cada URL. A autenticação de usuários é feita utilizando JWT (JSON Web Token).

## Funcionalidades

- Cadastro de usuários e autenticação via e-mail e senha.
- Encurtamento de URLs com geração de códigos curtos (de 6 caracteres).
- Redirecionamento automático para URLs originais utilizando códigos curtos.
- Listagem de URLs encurtadas para usuários autenticados, incluindo contagem de cliques.
- Atualização e exclusão lógica de URLs encurtadas.
- Documentação da API disponível via Swagger.

## Pré-requisitos

- Node.js (v20.x)
- Yarn
- Docker
- Docker Compose

## Instalação

1. Clone o repositório:

```bash
git clone https://seu-repositorio.git
cd seu-repositorio
```

## Executando a Aplicação

### Usando Docker

Build e execução dos contêineres:

```bash
docker-compose up --build
```

### Usando a Aplicação

Acesse a documentação da API no Swagger:

- http://localhost:8081/

## Testes

Este projeto inclui testes unitários para os serviços de autenticação e encurtamento de URLs.

## Pontos de Melhoria

### Versão Enterprise do KrakenD

Atualmente, o sistema utiliza o KrakenD para roteamento e agregação de serviços. No entanto, algumas funcionalidades avançadas, como redirecionamento automático e suporte completo ao Swagger UI, estão disponíveis apenas na [versão Enterprise do KrakenD](https://www.krakend.io/docs/enterprise/backends/client-redirect/). Para contornar essas limitações:

- Swagger UI: Um contêiner separado foi criado para servir a documentação da API via Swagger, acessível em http://localhost:8081/.

- Redirecionamento de URLs: Quando a requisição ocorre através do krakend, em vez de utilizar redirecionamentos 30x (não suportados na versão open-source do KrakenD), foi implementado um redirecionamento via JavaScript que retorna um status 200.

### Escalabilidade Horizontal

Para suportar um crescimento horizontal, onde o sistema precisa ser escalado para múltiplas instâncias, algumas melhorias podem ser implementadas:

- Divisão de Serviços: Separar os serviços em microsserviços independentes, cada um com seu próprio banco de dados, permitindo que sejam escalados de forma independente.

- Cache: Implementar um sistema de cache, como Redis, para armazenar URLs encurtadas e reduzir a carga no banco de dados.

### Migração para OAuth

A autenticação atual é baseada em JWT com login/senha. Para aumentar a segurança e facilitar a integração com outros serviços, uma migração para OAuth2 ou OpenID Connect pode ser considerada, permitindo o uso de provedores de identidade como Google ou um servidor OAuth próprio.

## To-Do List

### 1. Configuração Inicial do Projeto

- [x] Configuração do Monorepo:
  - Estruturar o projeto como um monorepo para separar serviços (gerenciamento de identidade e encurtamento de URL).
  - Configurar docker-compose para orquestrar os serviços.
- [x] Inicialização do Projeto:
  - Criar um novo projeto com NestJS utilizando TypeScript.
  - Configurar o TypeORM para o Postgres.
  - Configurar Swagger para documentação da API.
  - Configurar variáveis de ambiente para parâmetros como conexão ao banco de dados, porta do servidor, etc.

### 2. Estruturação do Banco de Dados

- [x] Modelagem de Tabelas:
  - Usuários: Tabela para armazenar informações de usuários (e-mail, senha, data de criação, data de atualização, data de exclusão).
  - URLs Encurtadas: Tabela para armazenar as URLs encurtadas (URL original, código encurtado, usuário associado, contador de cliques, data de criação, data de atualização, data de exclusão).
- [x] Migrations:
  - Implementar as migrations para a criação das tabelas no banco de dados.

### 3. Autenticação e Autorização

- [x] Cadastro de Usuários:
  - Criar endpoint para cadastro de usuários.
  - Implementar a criptografia de senhas utilizando bcrypt.
- [x] Autenticação:
  - Criar endpoint para autenticação com e-mail e senha.
  - Implementar geração de tokens JWT.
- [x] Autorização:
  - Proteger endpoints que requerem autenticação com JWT.

### 4. Implementação dos Endpoints

- [x] Encurtamento de URLs:
  - Criar um endpoint para encurtar URLs, aceitando requisições com e sem autenticação.
  - Gerar um código encurtado de no máximo 6 caracteres.
  - Salvar o código encurtado e a URL original no banco de dados. Se o usuário estiver autenticado, associar a URL ao usuário.
- [x] Listagem de URLs Encurtadas:
  - Criar um endpoint para listar todas as URLs encurtadas por um usuário autenticado, incluindo a contagem de cliques.
- [x] Atualização de URL Encurtada:
  - Criar um endpoint para atualizar a URL original de um código encurtado, permitindo que apenas o usuário autenticado dono da URL possa realizar a atualização.
- [x] Deleção Lógica de URLs Encurtadas:
  - Criar um endpoint para deletar logicamente uma URL encurtada, marcando o registro com a data de exclusão.

### 5. Redirecionamento e Contabilização de Cliques

- [x] Redirecionamento:
  - Criar um endpoint para redirecionar o usuário para a URL original ao acessar uma URL encurtada.
  - Incrementar o contador de cliques a cada acesso.

### 6. Testes e Validações

- [x] Testes Unitários:
  - Escrever testes unitários para todos os endpoints e funcionalidades usando Jest.
- [x] Validação de Entrada:
  - Implementar validações de entrada para todos os campos necessários nos endpoints.

### 7. Documentação e Observabilidade

- [x] Swagger:
  - Documentar todos os endpoints usando Swagger.
- [ ] Observabilidade:
  - Implementar ou abstrair logs, métricas e rastreamento (por exemplo, usando Sentry, Prometheus, etc.), configuráveis via variáveis de ambiente.

### 8. Deploy e Infraestrutura

- [x] Docker-Compose:
  - Configurar docker-compose para subir todo o ambiente localmente.
- [ ] Deploy em Cloud Provider:
  - Configurar o deploy da aplicação em um cloud provider (como AWS ou Azure) e documentar no README.
- [ ] Kubernetes:
  - Construir deployments do Kubernetes para deploy.
- [ ] Terraform:
  - Construir artefatos do Terraform para infraestrutura como código.
- [ ] CI/CD:
  - Configurar GitHub Actions para lint e testes automatizados.

### 9. Melhoria e Escalabilidade

- [x] Escalabilidade Horizontal:
  - Documentar pontos de melhoria para escalabilidade horizontal, como divisão de serviços, cache, etc.
- [ ] Multi-Tenant:
  - Implementar suporte a multi-tenant (ainda não aplicável).

### 10. Versão e Controle de Mudança

- [x] Changelog:
  - Criar e manter um changelog.
- [x] Git Tags:
  - Definir Git tags para cada versão de release.

### 11. Boas Práticas e Qualidade de Código

- [x] Pre-commit/Pre-push Hooks:
  - Configurar hooks para garantir qualidade do código.
- [x] Código Tolerante a Falhas:
  - Implementar práticas para garantir que o código seja tolerante a falhas.
