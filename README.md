# URL Shortener API

## Sumário

1. [Descrição](#descrição)
2. [Funcionalidades](#funcionalidades)
3. [Pré-requisitos](#pré-requisitos)
4. [Usando a Aplicação](#usando-a-aplicação)
5. [Testes](#testes)
6. [Pontos de Melhoria](#pontos-de-melhoria)
   - [Versão Enterprise do KrakenD](#versão-enterprise-do-krakend)
   - [Escalabilidade Horizontal](#escalabilidade-horizontal)
   - [Migração para OAuth](#migração-para-oauth)

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

- Docker
- Docker Compose

## Usando a Aplicação

1. Clone o repositório:

```bash
git clone https://github.com/andre-fig/url-shortener-monorepo
cd url-shortener-monorepo
```

2. Execute os contêineres:

```bash
docker-compose up --build
```

3. Acesse a documentação da API no Swagger:

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
