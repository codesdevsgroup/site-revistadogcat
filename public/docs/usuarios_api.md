# Documentação da API de Usuários e Autenticação

Esta documentação descreve os endpoints para gerenciamento de usuários e autenticação.

**Prefixo das Rotas:** `/auth` e `/users`

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

## Endpoints de Autenticação (`/auth`)

(Endpoints de registro, login, refresh, etc. permanecem os mesmos)

---

## Endpoints de Gerenciamento de Usuários (`/users`)

### 1. Listar Usuários

- **Endpoint:** `GET /users`
- **Autenticação:** 🔒 `ADMIN`
- **Descrição:** Retorna uma lista paginada de todos os usuários, com suporte a filtros e busca.
- **Query Params:**
  - `page` (opcional): Número da página (padrão: 1).
  - `limit` (opcional): Itens por página (padrão: 10).
  - `role` (opcional): Filtra por uma role específica (ex: `ADMIN`, `ASSINANTE`).
  - `search` (opcional): Termo de busca. **O backend deve procurar este termo nos campos `name`, `email` e `cpf` de forma case-insensitive.**
- **Resposta (200 OK):** Objeto de paginação com a lista de usuários.

(Demais endpoints de gerenciamento de usuários permanecem os mesmos)

---

(Seções de Tratamento de Erros e Guia de Integração permanecem as mesmas)
