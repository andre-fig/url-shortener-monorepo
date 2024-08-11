# Propostas de melhorias

## Redirecionamento de URLs no Projeto

### Contexto

No projeto atual, utliza-se o KrakenD como API Gateway para gerenciar o redirecionamento de URLs encurtadas. Durante a implementação, identificou-se uma limitação na versão Community do KrakenD relacionada ao gerenciamento de redirecionamentos HTTP (códigos 301/302). A limitação ocorre porque a versão Community do KrakenD segue redirecionamentos internamente, exibindo o conteúdo final da URL de destino em vez de simplesmente passar a resposta de redirecionamento para o cliente. Mais detalhes podem ser encontrados na [documentação do KrakenD](https://www.krakend.io/docs/enterprise/backends/client-redirect/).

### Limitação Identificada

Na versão Community do KrakenD, não existe uma opção nativa para impedir que o KrakenD siga redirecionamentos internamente. Isso resulta na exibição do conteúdo final ao cliente, o que não é o comportamento desejado para o nosso projeto de encurtamento de URLs. O comportamento correto seria que o cliente seguisse o redirecionamento, o que requer que o KrakenD retorne o status 301/302 e o cabeçalho `Location` diretamente ao cliente, sem seguir o redirecionamento.

### Solução temporária

Atualmente, a alternativa implementada utiliza um redirecionamento com JavaScript, onde o backend responde com um status 200 e um HTML contendo uma tag `<meta>` que faz o redirecionamento automático:

```typescript
res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url=${originalUrl}" />
      </head>
      <body>
        <p>Redirecting to <a href="${originalUrl}">${originalUrl}</a></p>
      </body>
    </html>
`);
```

#### Limitações e Problemas dessa Solução:

1. **SEO Comprometido**: Motores de busca podem não interpretar corretamente o redirecionamento via `<meta>`, prejudicando a indexação e o SEO da aplicação.

2. **Experiência do Usuário**: O redirecionamento via `<meta>` pode causar uma leve demora e, se o JavaScript estiver desativado, o redirecionamento pode falhar.

3. **Falta de Controle**: O redirecionamento no frontend limita o controle e a rastreabilidade no backend, dificultando auditorias e testes automatizados.
   - A compatibilidade com diferentes navegadores e dispositivos pode variar, especialmente em ambientes onde as configurações de segurança são mais restritivas.
   - Em redes com proxies que não processam corretamente o conteúdo HTML, o redirecionamento pode ser bloqueado ou ignorado.

### Melhoria Proposta

#### 1. Utilização do KrakenD Enterprise Edition

Se o projeto permitir, a migração para o **KrakenD Enterprise Edition** resolverá essa limitação. No KrakenD Enterprise, pode-se utilizar a configuração `no_redirect` para evitar que o gateway siga o redirecionamento.

##### Passos para Implementação:

- **Adição do `extra_config` no `krakend.json`**:

  No arquivo `krakend.json`, adicione a configuração abaixo no backend correspondente:

```json
{
  "endpoint": "/r/{id}",
  "method": "GET",
  "output_encoding": "no-op",
  "backend": [
    {
      "host": ["http://url-shortener:3000"],
      "url_pattern": "shortened-url/redirect/{id}",
      "encoding": "no-op",
      "extra_config": {
        "backend/http/client": {
          "no_redirect": true
        }
      }
    }
  ]
}
```

- **Alteração no Código do Backend**:

  No código do backend, altere a resposta para utilizar o método `res.redirect(originalUrl)`:

```typescript
  @Get('redirect/:shortCode')
  public async redirectToOriginal(
  @Param('shortCode') shortCode: string,
  @Res() res: Response,
  ): Promise<void> {
  const originalUrl = await this.urlShortenerService.getOriginalUrl(shortCode);
  if (!originalUrl) {
  throw new NotFoundException('URL not found');
  }
  res.redirect(originalUrl);
  }
```

Essa alteração permitirá que o cliente siga o redirecionamento sem que o KrakenD siga a URL e exiba o conteúdo final.

#### 2. Alternativa: Rota Disponível sem Utilizar o KrakenD

Se a migração para o KrakenD Enterprise Edition não for viável, uma alternativa seria deixar a rota `redirect/:shortCode` disponível diretamente no backend, sem passar pelo KrakenD. Isso evita a limitação de seguir redirecionamentos e permite que o cliente lide com o redirecionamento como esperado.

### Conclusão

A melhoria proposta visa corrigir o comportamento indesejado de redirecionamento na versão Community do KrakenD, utilizando a funcionalidade `no_redirect` disponível na versão Enterprise. Essa melhoria permitirá que o cliente final siga os redirecionamentos corretamente, oferecendo uma experiência de usuário consistente e alinhada com os requisitos do projeto. Caso a migração para o KrakenD Enterprise não seja possível, a alternativa de expor a rota diretamente no backend é uma solução viável.

# To-Do List

## 1. Configuração Inicial do Projeto

- [x] Configuração do Monorepo:
  - Estruturar o projeto como um monorepo para separar serviços (gerenciamento de identidade e encurtamento de URL).
  - Configurar docker-compose para orquestrar os serviços.
- [x] Inicialização do Projeto:
  - Criar um novo projeto com NestJS utilizando TypeScript.
  - Configurar o TypeORM para o Postgres.
  - Configurar Swagger para documentação da API.
  - Configurar variáveis de ambiente para parâmetros como conexão ao banco de dados, porta do servidor, etc.

## 2. Estruturação do Banco de Dados

- [x] Modelagem de Tabelas:
  - Usuários: Tabela para armazenar informações de usuários (e-mail, senha, data de criação, data de atualização, data de exclusão).
  - URLs Encurtadas: Tabela para armazenar as URLs encurtadas (URL original, código encurtado, usuário associado, contador de cliques, data de criação, data de atualização, data de exclusão).
- [x] Migrations:
  - Implementar as migrations para a criação das tabelas no banco de dados.

## 3. Autenticação e Autorização

- [x] Cadastro de Usuários:
  - Criar endpoint para cadastro de usuários.
  - Implementar a criptografia de senhas utilizando bcrypt.
- [x] Autenticação:
  - Criar endpoint para autenticação com e-mail e senha.
  - Implementar geração de tokens JWT.
- [x] Autorização:
  - Proteger endpoints que requerem autenticação com JWT.

## 4. Implementação dos Endpoints

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

## 5. Redirecionamento e Contabilização de Cliques

- [x] Redirecionamento:
  - Criar um endpoint para redirecionar o usuário para a URL original ao acessar uma URL encurtada.
  - Incrementar o contador de cliques a cada acesso.

## 6. Testes e Validações

- [ ] Testes Unitários:
  - Escrever testes unitários para todos os endpoints e funcionalidades usando Jest.
- [x] Validação de Entrada:
  - Implementar validações de entrada para todos os campos necessários nos endpoints.

## 7. Documentação e Observabilidade

- [ ] Swagger:
  - Documentar todos os endpoints usando Swagger.
- [ ] Observabilidade:
  - Implementar ou abstrair logs, métricas e rastreamento (por exemplo, usando Sentry, Prometheus, etc.), configuráveis via variáveis de ambiente.

## 8. Deploy e Infraestrutura

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

## 9. Melhoria e Escalabilidade

- [ ] Escalabilidade Horizontal:
  - Documentar pontos de melhoria para escalabilidade horizontal, como divisão de serviços, cache, etc.
- [ ] Multi-Tenant:
  - Implementar suporte a multi-tenant se aplicável.

## 10. Versão e Controle de Mudança

- [x] Changelog:
  - Criar e manter um changelog.
- [x] Git Tags:
  - Definir Git tags para cada versão de release.

## 11. Boas Práticas e Qualidade de Código

- [ ] Pre-commit/Pre-push Hooks:
  - Configurar hooks para garantir qualidade do código.
- [ ] Código Tolerante a Falhas:
  - Implementar práticas para garantir que o código seja tolerante a falhas.
