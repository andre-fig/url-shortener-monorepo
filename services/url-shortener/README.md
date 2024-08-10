# Criando uma Migration com Docker

Para criar uma migration no seu projeto dentro de um contêiner Docker, siga os passos abaixo:

1. **Verifique os Contêineres em Execução:**

   Primeiro, liste os contêineres em execução para identificar o ID ou nome do contêiner que você deseja acessar:

   ```bash
   docker ps
   ```

   Procure pelo contêiner que está rodando o serviço onde você deseja gerar a migration.

2. **Acesse o Contêiner:**

   Use o ID ou nome do contêiner para acessar o terminal dentro do contêiner. Substitua `<container_id>` pelo ID ou nome do contêiner:

   ```bash
   docker exec -it <container_id> /bin/sh
   ```

3. **Gere a Migration:**

   Uma vez dentro do contêiner, execute o comando para gerar a migration. Certifique-se de que você está no diretório correto onde o TypeORM está configurado:

   ```bash
   yarn typeorm migration:generate -d ./src/config/data-source.ts ./src/migrations/{NomeDaMigration}
   ```

   Este comando irá gerar uma nova migration chamada `InitialMigration` no diretório `src/migrations`.

4. **Saia do Contêiner:**

   Depois de gerar a migration, você pode sair do contêiner:

   ```bash
   exit
   ```

## Notas:

- **Verifique** se o arquivo `data-source.ts` está configurado corretamente com as entidades e as configurações do banco de dados.
- **Certifique-se** de que o TypeORM e o ts-node estão instalados no ambiente Docker.
