# Documentação da API de Usuários e Autenticação

Esta documentação descreve os endpoints da API para gerenciamento e autenticação de usuários.

## Modelo de Dados: Usuário

| Campo | Tipo | Descrição | Obrigatório no Cadastro |
| --- | --- | --- | --- |
| `userId` | `string` | Identificador único do usuário (CUID). | Não (gerado pelo servidor) |
| `userName` | `string` | Nome de usuário único para exibição pública. | Sim |
| `name` | `string` | Nome completo do usuário. | Sim |
| `email` | `string` | Endereço de e-mail único do usuário. | Sim |
| `password` | `string` | Senha do usuário (somente para escrita). | Sim |
| `cpf` | `string` | CPF do usuário. | Não |
| `telefone` | `string` | Telefone de contato do usuário. | Não |
| `avatarUrl` | `string` | URL da imagem de perfil do usuário. | Não |
| `role` | `string` | Papel do usuário no sistema. | Não (padrão: `CLIENTE`) |
| `active` | `boolean`| Indica se a conta do usuário está ativa. | Não (padrão: `false`) |
| `createdAt` | `string` | Data de criação da conta. | Não (gerado pelo servidor) |

## Níveis de Acesso (Roles)

O campo `role` define as permissões de um usuário no sistema.

| Role | Descrição |
| --- | --- |
| `CLIENTE` | Usuário padrão. Pode ler artigos e gerenciar o próprio perfil. |
| `EDITOR` | Pode criar, editar e gerenciar artigos, mas não tem acesso a configurações do sistema. |
| `ADMIN` | Acesso total. Pode gerenciar usuários, artigos e configurações do sistema. |

## Endpoints de Autenticação

### 1. Cadastro de Novo Usuário

- **Endpoint:** `POST /api/auth/register`
- **Resposta de Sucesso (201 Created - E você jurando que não ia dar certo.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

### 2. Ativação da Conta

- **Endpoint:** `POST /api/auth/activate`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

### 3. Login de Usuário

- **Endpoint:** `POST /api/auth/login`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (401 Unauthorized - Você não tem permissão, jovem gafanhoto.)**

### 4. Solicitar Redefinição de Senha

- **Endpoint:** `POST /api/auth/forgot-password`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**

### 5. Redefinir Senha

- **Endpoint:** `POST /api/auth/reset-password`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

## Endpoints de Gerenciamento de Usuário

(Requerem autenticação)

### 1. Obter Dados do Usuário

- **Endpoint:** `GET /api/users/{id}`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.)**

### 2. Atualizar Dados do Usuário

- **Endpoint:** `PUT /api/users/{id}`
- **Descrição:** Atualiza os dados de um usuário. O usuário só pode atualizar seus próprios dados (a menos que seja ADMIN).
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se tentar editar outro usuário sem ser ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.)**

### 3. Atualizar Role do Usuário (Apenas Admin)

- **Endpoint:** `PATCH /api/users/{id}/role`
- **Descrição:** Atualiza o nível de acesso (role) de um usuário.
- **Permissão Requerida:** `ADMIN`
- **Corpo da Requisição:**
  ```json
  {
    "role": "EDITOR"
  }
  ```
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se a role fornecida for inválida.
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se o requisitante não for ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o usuário não for encontrado.

## Endpoint de Upload de Avatar

### 1. Upload de Avatar

- **Endpoint:** `POST /api/users/avatar-upload`
- **Descrição:** O back-end deve associar a URL ao usuário autenticado.
- **Corpo da Requisição:** `multipart/form-data` com um campo `avatar` contendo o arquivo.
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  {
    "avatarUrl": "https://example.com/uploads/avatars/nome_do_avatar_12345.jpg"
  }
  ```
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**
- **Resposta de Erro (401 Unauthorized - Você não tem permissão, jovem gafanhoto.)**
