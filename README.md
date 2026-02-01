# FomeZero - Sistema PDV para Lanchonete

Sistema de Ponto de Venda (PDV) desenvolvido com ASP.NET Core 9 e Angular 19.

## Tecnologias

### Backend
- ASP.NET Core 9.0
- Entity Framework Core
- PostgreSQL
- JWT Authentication

### Frontend
- Angular 19
- Angular Material
- TypeScript

## Configuracao

### 1. Banco de Dados

Crie um banco de dados PostgreSQL chamado `fomezero`.

### 2. Backend

1. Navegue ate a pasta do backend:
   ```bash
   cd FomeZero
   ```

2. Copie o arquivo de configuracao de exemplo:
   ```bash
   cp appsettings.Development.json.example appsettings.Development.json
   ```

3. Edite o arquivo `appsettings.Development.json` com suas credenciais:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=fomezero;Username=seu_usuario;Password=sua_senha"
     },
     "Jwt": {
       "Secret": "SuaChaveSecretaComNoMinimo32Caracteres!"
     }
   }
   ```

4. Execute as migrations:
   ```bash
   dotnet ef database update
   ```

5. Execute o projeto:
   ```bash
   dotnet run
   ```

### 3. Frontend

1. Navegue ate a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependencias:
   ```bash
   npm install
   ```

3. Execute o projeto:
   ```bash
   ng serve
   ```

4. Acesse: http://localhost:4200

## Funcionalidades

- Cadastro de Clientes
- Cadastro de Lanches
- Cadastro de Formas de Pagamento
- Cadastro de Usuarios
- Lancamento de Vendas (a vista ou fiado)
- Contas a Receber
- Dashboard com resumo

## Licenca

Este projeto e privado.
