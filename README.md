# TODO: Centralizar Código Repetido e Melhorar Manutenção

## **Descrição:**

Atualmente, há entidades e funções utilitárias duplicadas entre os serviços (`auth-service`, `url-shortener`), o que pode causar inconsistências e problemas, especialmente ao gerar migrations.

## **Ações Propostas:**

1. **Criar Módulo `shared`:**

   - Centralizar entidades (`User`, etc.) e funções utilitárias em um módulo `shared`.
   - Refatorar os serviços para importar código do `shared` em vez de duplicá-lo.

2. **Benefícios:**

   - **Consistência:** Garante que todos os serviços usem a mesma versão do código.
   - **Facilidade de Manutenção:** Simplifica a atualização e correção de bugs em entidades e utilitários.
   - **Migrations Confiáveis:** Evita problemas nas migrations ao garantir que todos os serviços compartilhem as mesmas entidades.

3. **Desafios:**
   - **Configuração Inicial:** Pode aumentar a complexidade inicial do projeto.

## **Decisão Futura:**

Implementar essa refatoração quando o sistema começar a escalar ou se surgirem problemas com a manutenção do código duplicado.
