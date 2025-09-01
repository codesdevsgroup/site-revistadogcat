# Documentação da API de Usuários

Esta documentação descreve os endpoints para gerenciamento de usuários.

**Prefixo da Rota:** `/users`

---

## Modelo de Dados e Enums

### Objeto User (Resposta Pública)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `userId` | `string` | Identificador único do usuário. |
| `userName` | `string` | Nome de usuário |
| `name` | `string` | Nome completo do usuário. |
| `email` | `string` | Endereço de e-mail do usuário. |
| `cpf` | `string` | (Opcional) CPF do usuário. |
| `telefone` | `string` | (Opcional) Telefone do usuário. |
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

### 2. Obter Perfil do Usuário Autenticado

- **Endpoint:** `GET /users/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna o perfil completo do usuário que está fazendo a requisição.
- **Resposta (200 OK):** Objeto `User`.

### 3. Obter Usuário por ID

- **Endpoint:** `GET /users/{id}`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna o perfil público de um usuário específico.
- **Resposta (200 OK):** Objeto `User`.

### 4. Atualizar Próprio Perfil

- **Endpoint:** `PATCH /users/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Permite que o usuário autenticado atualize seu próprio perfil (`name`, `userName`, `telefone`, `cpf`, etc.).
- **Resposta (200 OK):** Objeto `User` atualizado.

### 5. Atualizar Dados de um Usuário

- **Endpoint:** `PATCH /users/{id}`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Permite que um administrador atualize os dados de qualquer usuário.
- **Resposta (200 OK):** Objeto `User` atualizado.

### 6. Upload de Avatar

- **Endpoint:** `POST /users/avatar-upload`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Faz o upload de uma imagem de avatar para o usuário autenticado.
- **Corpo da Requisição:** `multipart/form-data` com o campo `avatar`.
- **Resposta (200 OK):** `{ "avatarUrl": "..." }`

### 7. Criar Usuário para Terceiro

- **Endpoint:** `POST /users/register-third-party`
- **Autenticação:** Nenhuma (Endpoint público)
- **Descrição:** Cria um novo usuário com dados básicos.
- **Corpo da Requisição:**
  ```json
  {
    "nome": "Maria Santos",
    "email": "maria.santos@example.com",
    "cpf": "987.654.321-00",
    "telefone": "(11) 98888-7777"
  }
  ```
- **Resposta (201 Created):** `{ "userId": "cly123abcde" }`

### 8. Excluir Usuário (Soft Delete)

- **Endpoint:** `DELETE /users/{id}`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Desativa a conta de um usuário (soft delete).
- **Resposta (200 OK):** Objeto `User` atualizado.

### 9. Restaurar Usuário

- **Endpoint:** `POST /users/{id}/restore`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Reativa a conta de um usuário que foi desativada.
- **Resposta (200 OK):** Objeto `User` atualizado.

### 10. Atualizar Role de Usuário

- **Endpoint:** `PATCH /users/{id}/role`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Altera o nível de acesso (role) de um usuário.
- **Corpo da Requisição:** `{ "role": "ASSINANTE" }`
- **Resposta (200 OK):** Objeto `User` atualizado.
