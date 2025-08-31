# Documentação da API de Usuários

Esta documentação descreve os endpoints para gerenciamento de usuários.

**Prefixo da Rota:** `/users`

---

## Modelo de Dados e Enums

### Objeto User (Resposta Pública)

Este é o objeto de usuário retornado na maioria das respostas da API.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `userId` | `string` | Identificador único do usuário. |
| `userName` | `string` | Nome de usuário único. |
| `name` | `string` | Nome completo do usuário. |
| `email` | `string` | Endereço de e-mail do usuário. |
| `avatarUrl` | `string` | URL da imagem de perfil. |
| `role` | `Role` | Nível de acesso do usuário. |
| `active` | `boolean`| Se a conta do usuário está ativa. |
| `createdAt` | `string` | Data de criação da conta. |

### Enum: `Role`

| Valor | Descrição |
| --- | --- |
| `USUARIO` | Usuário padrão com acesso a conteúdo público. |
| `DONO_PET_APROVADO` | Dono de pet com cadastro verificado. |
| `ASSINANTE` | Usuário com assinatura premium ativa. |
| `DONO_PET_APROVADO_ASSINANTE` | Dono de pet verificado e assinante. |
| `EDITOR` | Permissão para criar e gerenciar artigos. |
| `ADMIN` | Acesso total ao sistema. |
| `FUNCIONARIO` | Acesso a funcionalidades internas específicas. |

---

## Endpoints de Gerenciamento de Usuários (`/users`)

### 1. Listar Usuários

- **Endpoint:** `GET /users`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Retorna uma lista paginada de todos os usuários.
- **Query Params:** `page`, `limit`, `search`, `role`.
- **Resposta (200 OK):** Objeto de paginação com a lista de usuários.

### 2. Obter Usuário por ID

- **Endpoint:** `GET /users/{id}`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna o perfil público de um usuário específico.
- **Resposta (200 OK):** Objeto `User`.

### 3. Atualizar Próprio Perfil

- **Endpoint:** `PATCH /users/profile`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Permite que o usuário autenticado atualize seu próprio perfil (`name`, `userName`, `telefone`, etc.).
- **Resposta (200 OK):** Objeto `User` atualizado.

### 4. Upload de Avatar

- **Endpoint:** `POST /users/avatar-upload`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Faz o upload de uma imagem de avatar para o usuário autenticado.
- **Corpo da Requisição:** `multipart/form-data` com o campo `avatar`.
- **Resposta (200 OK):** `{ "avatarUrl": "..." }`

### 5. Bloquear Usuário

- **Endpoint:** `PATCH /users/{id}/block`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Bloqueia a conta de um usuário.
- **Resposta (200 OK):** Objeto `User` atualizado.

### 6. Desbloquear Usuário

- **Endpoint:** `PATCH /users/{id}/unblock`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Desbloqueia a conta de um usuário.
- **Resposta (200 OK):** Objeto `User` atualizado.

### 7. Atualizar Role de Usuário

- **Endpoint:** `PATCH /users/{id}/role`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Altera o nível de acesso (role) de um usuário.
- **Corpo da Requisição:** `{ "role": "ASSINANTE" }`
- **Resposta (200 OK):** Objeto `User` atualizado.
