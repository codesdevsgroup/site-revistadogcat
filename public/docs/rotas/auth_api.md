# Documentação da API de Autenticação

Esta documentação descreve os endpoints para autenticação, gerenciamento de sessão e recuperação de conta de usuários.

**Prefixo da Rota:** `/auth`

---

## Modelo de Dados e Enums

### Objeto User (Resposta de Autenticação)

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `userId` | `string` | Identificador único do usuário. |
| `userName` | `string` | Nome de usuário único. |
| `name` | `string` | Nome completo do usuário. |
| `email` | `string` | Endereço de e-mail do usuário. |
| `avatarUrl` | `string` | URL da imagem de perfil. |
| `role` | `Role` | Nível de acesso do usuário. |

### Enum: `Role`

| Valor | Descrição |
| --- | --- | --- |
| `USUARIO` | Usuário padrão com acesso a conteúdo público. |
| `DONO_PET_APROVADO` | Dono de pet com cadastro verificado. |
| `ASSINANTE` | Usuário com assinatura premium ativa. |
| `DONO_PET_APROVADO_ASSINANTE` | Dono de pet verificado e assinante. |
| `EDITOR` | Permissão para criar e gerenciar artigos. |
| `ADMIN` | Acesso total ao sistema. |
| `FUNCIONARIO` | Acesso a funcionalidades internas específicas. |

---

## Endpoints de Autenticação (`/auth`)

### 1. Registrar Novo Usuário

- **Endpoint:** `POST /auth/register`
- **Descrição:** Cria uma nova conta de usuário, que já nasce **ativa**.
- **Corpo da Requisição:** `CreateUserDto` (contendo `name`, `email`, `password`, etc.).
- **Resposta (201 Created):** Mensagem de sucesso e os dados do usuário criado.

### 2. Login

- **Endpoint:** `POST /auth/login`
- **Descrição:** Autentica um usuário e retorna um `access_token` (curta duração), um `refresh_token` (longa duração) e os dados do usuário.
- **Corpo da Requisição:** `{ "identification": "user@email.com", "password": "user_password" }`
- **Resposta (200 OK):**
  ```json
  {
    "access_token": "eyJ...",
    "refresh_token": "a1b2c3...",
    "user": { ... } // Objeto User (Resposta de Autenticação)
  }
  ```

### 3. Renovar Token de Acesso (Refresh)

- **Endpoint:** `POST /auth/refresh`
- **Autenticação:** 🔒 Requer `access_token` válido no cabeçalho `Authorization`.
- **Descrição:** Usa um `refresh_token` válido para gerar um novo par de `access_token` e `refresh_token`, estendendo a sessão do usuário sem exigir um novo login.
- **Corpo da Requisição:**
  ```json
  {
    "refresh_token": "a1b2c3..."
  }
  ```
- **Resposta (200 OK):** Um novo par de tokens e os dados do usuário.
  ```json
  {
    "access_token": "eyJ_new...",
    "refresh_token": "d4e5f6_new...",
    "user": { ... }
  }
  ```
- **Resposta de Erro (401 Unauthorized):** Se o `refresh_token` for inválido ou expirado.

### 4. Obter Perfil do Usuário Logado

- **Endpoint:** `GET /auth/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna os dados básicos do usuário autenticado.
- **Resposta (200 OK):** Objeto `User` (Resposta de Autenticação).

### 5. Logout

- **Endpoint:** `POST /auth/logout`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Invalida a sessão atual do usuário no servidor, aumentando a `tokenVersion`. Isso invalida tanto o `access_token` quanto o `refresh_token` associados àquela sessão.
- **Resposta (200 OK):** Mensagem de sucesso.

### 6. Esqueci Minha Senha

- **Endpoint:** `POST /auth/forgot-password`
- **Descrição:** Inicia o fluxo de redefinição de senha. Envia um token por e-mail.
- **Corpo da Requisição:** `{ "email": "user@email.com" }`
- **Resposta (200 OK):** Mensagem de sucesso.

### 7. Redefinir Senha

- **Endpoint:** `POST /auth/reset-password`
- **Descrição:** Define uma nova senha usando o token de redefinição.
- **Corpo da Requisição:** `{ "token": "...", "password": "new_password", "passwordConfirmation": "new_password" }`
- **Resposta (200 OK):** Mensagem de sucesso.

---

## Guia de Integração Frontend (Fluxo de Tokens)

O sistema usa um par de tokens para gerenciar sessões de forma segura e eficiente.

### Estratégia de Armazenamento

1.  **`access_token` (Token de Acesso):**
    - **Armazenamento:** **Em memória** (ex: variável de estado global, Contexto React, Redux, etc.).
    - **Propósito:** É de curta duração e usado para autenticar a maioria das requisições à API. Armazená-lo em memória o protege contra ataques XSS.

2.  **`refresh_token` (Token de Atualização):**
    - **Armazenamento:** **`localStorage`** ou armazenamento persistente seguro.
    - **Propósito:** É de longa duração e usado exclusivamente para obter um novo `access_token` quando o antigo expirar.

### Fluxo de Execução

1.  **Login:** Após o login bem-sucedido, armazene o `access_token` em memória e o `refresh_token` no `localStorage`.

2.  **Requisições Autenticadas:** Para cada chamada a um endpoint protegido, envie o `access_token` no cabeçalho `Authorization: Bearer <token>`.

3.  **Tratamento de Token Expirado (Erro 401):**
    - Configure um **interceptor de API** (ex: com Axios) para capturar respostas com status `401 Unauthorized`.
    - Ao receber um `401`, o interceptor deve:
        a. Pausar a requisição original que falhou.
        b. Fazer uma chamada silenciosa para `POST /auth/refresh`, enviando o `refresh_token`.
        c. **Se o refresh for bem-sucedido:** A API retornará um novo par de tokens. Atualize o `access_token` em memória e o `refresh_token` no `localStorage`.
        d. Reenvie a requisição original (que estava pausada), agora com o novo `access_token`.
        e. **Se o refresh falhar:** O `refresh_token` é inválido. Limpe todos os tokens armazenados e redirecione o usuário para a tela de login.

4.  **Logout:** Ao fazer logout, chame o endpoint `POST /auth/logout`, limpe ambos os tokens do armazenamento local e redirecione o usuário para a tela de login.

---

## Configuração de Variáveis de Ambiente

As durações dos tokens JWT são configuráveis através das seguintes variáveis de ambiente no arquivo `.env`:

| Variável | Descrição | Formato | Padrão |
| --- | --- | --- | --- |
| `JWT_SECRET` | Segredo usado para assinar os tokens JWT. **Essencial para a segurança.** | String | `default-access-secret` |
| `JWT_TTL` | Tempo de vida do `access_token`. | String (ex: `15m`, `1h`, `7d`) | `15m` |
| `JWT_REFRESH_TTL` | Tempo de vida do `refresh_token`. | String (ex: `7d`, `30d`, `1y`) | `7d` |
