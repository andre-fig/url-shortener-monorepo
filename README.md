# To-Do List

## 1. Configuração Inicial do Projeto

- [x] Configuração do Monorepo (se aplicável):
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

- [X] Cadastro de Usuários:
  - Criar endpoint para cadastro de usuários.
  - Implementar a criptografia de senhas utilizando bcrypt.
- [X] Autenticação:
  - Criar endpoint para autenticação com e-mail e senha.
  - Implementar geração de tokens JWT.
- [ ] Autorização:
  - Proteger endpoints que requerem autenticação com JWT.

## 4. Implementação dos Endpoints

- [ ] Encurtamento de URLs:
  - Criar um endpoint para encurtar URLs, aceitando requisições com e sem autenticação.
  - Gerar um código encurtado de no máximo 6 caracteres.
  - Salvar o código encurtado e a URL original no banco de dados. Se o usuário estiver autenticado, associar a URL ao usuário.
- [ ] Listagem de URLs Encurtadas:
  - Criar um endpoint para listar todas as URLs encurtadas por um usuário autenticado, incluindo a contagem de cliques.
- [ ] Atualização de URL Encurtada:
  - Criar um endpoint para atualizar a URL original de um código encurtado, permitindo que apenas o usuário autenticado dono da URL possa realizar a atualização.
- [ ] Deleção Lógica de URLs Encurtadas:
  - Criar um endpoint para deletar logicamente uma URL encurtada, marcando o registro com a data de exclusão.

## 5. Redirecionamento e Contabilização de Cliques

- [ ] Redirecionamento:
  - Criar um endpoint para redirecionar o usuário para a URL original ao acessar uma URL encurtada.
  - Incrementar o contador de cliques a cada acesso.

## 6. Testes e Validações

- [ ] Testes Unitários:
  - Escrever testes unitários para todos os endpoints e funcionalidades usando Jest.
- [ ] Validação de Entrada:
  - Implementar validações de entrada para todos os campos necessários nos endpoints.

## 7. Documentação e Observabilidade

- [ ] Swagger:
  - Documentar todos os endpoints usando Swagger.
- [ ] Observabilidade:
  - Implementar ou abstrair logs, métricas e rastreamento (por exemplo, usando Sentry, Prometheus, etc.), configuráveis via variáveis de ambiente.

## 8. Deploy e Infraestrutura

- [ ] Docker-Compose:
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

- [ ] Changelog:
  - Criar e manter um changelog.
- [ ] Git Tags:
  - Definir Git tags para cada versão de release.

## 11. Boas Práticas e Qualidade de Código

- [ ] Pre-commit/Pre-push Hooks:
  - Configurar hooks para garantir qualidade do código.
- [ ] Código Tolerante a Falhas:
  - Implementar práticas para garantir que o código seja tolerante a falhas.
