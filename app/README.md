# Order Manager: Sistema de Gerenciamento de Pedidos

Aplicação web desenvolvida em **Node.js** para gerenciamento, cadastro e visualização de pedidos, produtos e clientes utilizando arquitetura **MVC**, renderização server-side com **EJS** e persistência em banco de dados **MySQL** via **Sequelize**.

## 🛠️ Tecnologias e Dependências

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para roteamento e middlewares
- **EJS**: Motor de templates para renderização server-side (SSR)
- **Sequelize**: ORM para manipulação e mapeamento do MySQL
- **MySQL2**: Driver de conexão para o banco de dados MySQL
- **dotenv**: Gerenciamento de variáveis de ambiente

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16.x ou superior)
- **npm** (gerenciador de pacotes do Node)
- **MySQL Server** (executando localmente ou em nuvem)

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 2. Instalar as dependências

Execute o comando abaixo na raiz do projeto para instalar todas as bibliotecas listadas no `package.json`:

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Crie um arquivo chamado `.env` na raiz do projeto utilizando o arquivo `.env.example` como base:

#### Linux / macOS

```bash
cp .env.example .env
```

#### Windows (PowerShell)

```powershell
copy .env.example .env
```

Abra o arquivo `.env` recém-criado e ajuste as credenciais de conexão de acordo com o seu ambiente MySQL local:

```env
HOST=localhost
PORT=3000
USER=seu_usuario_mysql
PASSWORD=sua_senha_mysql
DATABASE=order_manager
```

> **Nota:** Certifique-se de que o banco de dados especificado em `DATABASE` já esteja criado no seu servidor MySQL antes de rodar a aplicação.

### 4. Iniciar o servidor

Para rodar a aplicação:

```bash
npm start
```

### 5. Acessar a aplicação

Com o servidor rodando, abra seu navegador e acesse:

```text
http://localhost:3000/customer
```
> **Nota:** A primeira funcionalidade entregue é na rota de customer para lista e adicionar novos clientes. A home page está em construção.

## 🛣️ Rotas da Aplicação

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/customer` | Renderiza a tabela com a listagem de clientes. |
| `GET` | `/customer/new` | Exibe o formulário para cadastro de um novo cliente. |
| `POST` | `/customer` | Processa a criação e validação do cliente no banco de dados. |
