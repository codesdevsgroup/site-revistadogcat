# Documentação da API de Usuários

Esta documentação descreve os endpoints para gerenciamento de usuários.

**Prefixo da Rota:** `/users`

---

## Modelos de Dados e Enums

### Objeto User (Resposta Pública)

Este é o objeto de usuário padrão retornado pela maioria dos endpoints.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `userId` | `string` | Identificador único do usuário. |
| `userName` | `string` | Nome de usuário. |
| `name` | `string` | Nome completo do usuário. |
| `email` | `string` | Endereço de e-mail do usuário. |
| `cpf` | `string` | (Opcional) CPF do usuário. |
| `avatarUrl` | `string` | URL da imagem de perfil. |
| `role` | `Role` | Nível de acesso do usuário. |
| `active` | `boolean`| Se a conta do usuário está ativa. |
| `createdAt` | `string` | Data de criação da conta. |
| `endereco` | `Endereco` | Objeto contendo o **endereço principal** do usuário. Se não houver, os campos virão vazios. |

### Objeto User (Resposta Completa - `FullUserDto`)

Este objeto é retornado **apenas** pelo endpoint `GET /users/me` e inclui todos os dados do usuário.

| Campo | Tipo | Descrição |
| --- | --- | --- |
| *(todos os campos da Resposta Pública)* | | |
| `telefone` | `string` | (Opcional) Telefone do usuário. |
| `enderecos` | `Endereco[]` | Uma **lista completa** de todos os endereços cadastrados para o usuário. |

### Objeto Endereco

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `logradouro` | `string` | Rua, avenida, etc. |
| `numero` | `string` | Número do imóvel. |
| `complemento`| `string` | (Opcional) Complemento do endereço. |
| `bairro` | `string` | Bairro. |
| `cidade` | `string` | Cidade. |
| `estado` | `string` | Sigla do estado (UF). |
| `cep` | `string` | Código de Endereçamento Postal. |

### Enum: `Role`

| Valor | Descrição |
| --- | --- |
| `USUARIO` | Usuário padrão com acesso a conteúdo público. |
| `DONO_PET_APROVADO` | Dono de pet com cadastro verificado. |
| `ASSINANTE` | Usuário com assinatura premium ativa. |
| `DONO_PET_APROVADO_ASSINANTE` | Dono de pet verificado e assinante. |
| `ADMIN` | Acesso total ao sistema e aos painéis administrativos. |
| `EDITOR` | Permissão para criar, editar e gerenciar artigos. |
| `FUNCIONARIO` | Acesso a funcionalidades internas específicas da operação. |
| `JURADO` | Papel destinado à avaliação em concursos/eventos (acesso restrito a funcionalidades de julgamento). |

---

## Endpoints de Gerenciamento de Usuários (`/users`)

### 1. Listar Usuários

- **Endpoint:** `GET /users`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Retorna uma lista paginada de todos os usuários.
- **Ordenação padrão:** `createdAt` em ordem decrescente (mais recentes primeiro).
- **Query Params:**

  | Parâmetro | Tipo | Padrão | Descrição |
  | --- | --- | --- | --- |
  | `page` | `number` | `1` | Número da página (mínimo 1). |
  | `limit` | `number` | `20` | Itens por página (1–100). |
  | `search` | `string` | | Busca textual por nome, email ou userName (case-insensitive). |
  | `role` | `Role` | | Filtra por papel do usuário. Valores: `USUARIO`, `DONO_PET_APROVADO`, `ASSINANTE`, `DONO_PET_APROVADO_ASSINANTE`, `ADMIN`, `EDITOR`, `FUNCIONARIO`, `JURADO`. |
  | `userName` | `string` | | Filtro adicional por userName (contains, case-insensitive). |
  | `email` | `string` | | Filtro adicional por email (contains, case-insensitive). |

- **Resposta (200 OK):** Objeto com paginação e dados públicos do usuário.

  ```json
  {
    "data": [
      {
        "userId": "clxy123abc",
        "userName": "maria.souza",
        "name": "Maria Souza",
        "email": "maria@example.com",
        "cpf": null,
        "avatarUrl": null,
        "role": "USUARIO",
        "active": true,
        "blocked": false,
        "createdAt": "2025-08-25T12:34:56.000Z",
        "updatedAt": "2025-08-31T08:10:00.000Z",
        "lastLogin": "2025-09-01T10:00:00.000Z",
        "endereco": {
          "logradouro": "Rua das Flores",
          "numero": "123",
          "complemento": "Apto 12",
          "bairro": "Centro",
          "cidade": "São Paulo",
          "estado": "SP",
          "cep": "01000-000"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

- **Observações:**
  - Os filtros `search`, `userName` e `email` podem ser combinados com `role`.
  - Quando não houver resultados, `data` será um array vazio e `total` será `0`.

### 2. Obter Perfil Completo do Usuário Autenticado

- **Endpoint:** `GET /users/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna o perfil **completo** do usuário que está fazendo a requisição.
- **Resposta (200 OK):** `Objeto User (Resposta Completa - FullUserDto)`.
  ```json
  {
    "userId": "cly123abcde",
    "name": "João da Silva",
    "email": "joao.silva@example.com",
    "cpf": "111.222.333-44",
    "telefone": "(11) 99999-8888",
    // ... outros campos
    "endereco": { // Endereço principal
      "logradouro": "Rua Principal",
      "numero": "100",
      "complemento": null,
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01000-000"
    },
    "enderecos": [ // Lista completa de endereços
      {
        "logradouro": "Rua Principal",
        "numero": "100",
        // ...
      },
      {
        "logradouro": "Avenida Secundária",
        "numero": "200",
        // ...
      }
    ]
  }
  ```

### 3. Obter Usuário por ID

- **Endpoint:** `GET /users/{id}`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna o perfil público de um usuário específico.
- **Resposta (200 OK):** `Objeto User (Resposta Pública)`.

### 4. Atualizar Próprio Perfil

- **Endpoint:** `PATCH /users/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Permite que o usuário autenticado atualize seu próprio perfil.
- **Resposta (200 OK):** `Objeto User (Resposta Pública)` atualizado.

### 5. Atualizar Dados de um Usuário

- **Endpoint:** `PATCH /users/{id}`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Permite que um administrador atualize os dados de qualquer usuário.
- **Corpo da Requisição:** Objeto parcial com os campos que deseja atualizar. Campos suportados:
  - `name`: `string`
  - `userName`: `string`
  - `email`: `string`
  - `cpf`: `string` (opcional)
  - `telefone`: `string` (opcional)
  - `active`: `boolean`
  - `role`: `Role` — valores permitidos:
    - `USUARIO`
    - `DONO_PET_APROVADO`
    - `ASSINANTE`
    - `DONO_PET_APROVADO_ASSINANTE`
    - `ADMIN`
    - `EDITOR`
    - `FUNCIONARIO`
    - `JURADO`
  
  Observações:
  - Apenas usuários com role `ADMIN` podem alterar o campo `role` de outros usuários.
  - O valor enviado deve coincidir exatamente com o enum `Role` do backend (case-sensitive).
  - Recomenda-se validar regras internas de segurança, como impedir que um admin remova o próprio acesso sem haver outro admin ativo.

- **Exemplo de Requisição:**
  ```json
  {
    "name": "Regular User",
    "userName": "user01",
    "email": "user@user.com",
    "role": "EDITOR",
    "active": true
  }
  ```
- **Resposta (200 OK):** `Objeto User (Resposta Pública)` atualizado.

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
- **Resposta (200 OK):** `Objeto User (Resposta Pública)` atualizado.

### 9. Restaurar Usuário

- **Endpoint:** `POST /users/{id}/restore`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Reativa a conta de um usuário que foi desativada.
- **Resposta (200 OK):** `Objeto User (Resposta Pública)` atualizado.

### 10. Atualizar Role de Usuário

- **Endpoint:** `PATCH /users/{id}/role`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Altera o nível de acesso (role) de um usuário.
- **Corpo da Requisição:** `{ "role": "ASSINANTE" }`
- **Resposta (200 OK):** `Objeto User (Resposta Pública)` atualizado.
