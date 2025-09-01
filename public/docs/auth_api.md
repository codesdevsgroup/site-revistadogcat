# Documentação da API de Autenticação

Esta documentação descreve os endpoints para autenticação de usuários.

**Prefixo da Rota:** `/auth`

---

## Modelo de Dados e Enums

### Objeto User (Resposta Pública)

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

### 1. Registrar Novo Usuário

- **Endpoint:** `POST /auth/register`
- **Descrição:** Cria uma nova conta de usuário. Um e-mail de ativação é enviado.
- **Corpo da Requisição:** `CreateUserDto` (contém `name`, `userName`, `email`, `password`, e campos opcionais como `cpf`, `telefone`).
- **Resposta (201 Created):** Mensagem de sucesso indicando que o e-mail foi enviado.

### 2. Ativar Conta

- **Endpoint:** `POST /auth/activate`
- **Descrição:** Ativa a conta de um usuário usando o token enviado por e-mail.
- **Corpo da Requisição:** `{ "token": "activation-token-from-email" }`
- **Resposta (200 OK):** Mensagem de sucesso.

### 3. Reenviar Email de Ativação

- **Endpoint:** `POST /auth/resend-activation`
- **Descrição:** Reenvia o e-mail com o link de ativação para um usuário que ainda não ativou a conta.
- **Corpo da Requisição:** `{ "email": "user@email.com" }`
- **Resposta (200 OK):** Mensagem de sucesso.

### 4. Login

- **Endpoint:** `POST /auth/login`
- **Descrição:** Autentica um usuário e retorna um par de tokens (acesso e refresh).
- **Corpo da Requisição:** `{ "identification": "user@email.com", "password": "user_password" }`
- **Resposta (200 OK):**
  ```json
  {
    "access_token": "...",
    "refresh_token": "...",
    "user": { ... } // Objeto User
  }
  ```

### 5. Renovar Token de Acesso

- **Endpoint:** `POST /auth/refresh`
- **Descrição:** Gera um novo `access_token` usando um `refresh_token` válido. Este mecanismo permite que o usuário continue logado sem precisar inserir suas credenciais repetidamente.
- **Quando usar:** Este endpoint deve ser chamado pela aplicação cliente sempre que uma requisição a um endpoint protegido falhar com um status `401 Unauthorized` e a mensagem de erro específica for `Token de acesso expirado`.
- **Fluxo de Uso:**
  1.  O cliente faz uma requisição para um endpoint protegido (ex: `GET /users/me`) usando o `access_token`.
  2.  O servidor responde com `401 Unauthorized` porque o `access_token` expirou.
  3.  O cliente intercepta esse erro e faz uma chamada para `POST /auth/refresh`, enviando o `refresh_token` que foi armazenado durante o login.
  4.  O servidor valida o `refresh_token`. Se for válido, retorna um novo `access_token` e um novo `refresh_token`.
  5.  O cliente substitui os tokens antigos pelos novos.
  6.  O cliente refaz a requisição original que falhou (passo 1), agora com o novo `access_token`.
- **Corpo da Requisição:** `{ "refreshToken": "o-refresh-token-armazenado" }`
- **Resposta (200 OK):**
  ```json
  {
    "access_token": "novo_access_token",
    "refresh_token": "novo_refresh_token",
    "user": { ... } // Objeto User
  }
  ```
- **Resposta de Erro (401 Unauthorized):** Se o `refresh_token` for inválido, expirado ou revogado, o servidor retornará um erro `401`. Nesse caso, a sessão do usuário é considerada encerrada, e o cliente **deve** redirecioná-lo para a tela de login.

### 6. Obter Perfil do Usuário Logado

- **Endpoint:** `GET /auth/me`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Retorna os dados completos do usuário autenticado.
- **Resposta (200 OK):** Objeto `User`.

### 7. Logout

- **Endpoint:** `POST /auth/logout`
- **Autenticação:** 🔒 Requer `access_token`.
- **Descrição:** Invalida os tokens do usuário no servidor.
- **Resposta (200 OK):** Mensagem de sucesso.

### 8. Esqueci Minha Senha

- **Endpoint:** `POST /auth/forgot-password`
- **Descrição:** Inicia o fluxo de redefinição de senha. Envia um token por e-mail.
- **Corpo da Requisição:** `{ "email": "user@email.com" }`
- **Resposta (200 OK):** Mensagem de sucesso.

### 9. Redefinir Senha

- **Endpoint:** `POST /auth/reset-password`
- **Descrição:** Define uma nova senha usando o token de redefinição.
- **Corpo da Requisição:** `{ "token": "...", "password": "new_password", "passwordConfirmation": "new_password" }`
- **Resposta (200 OK):** Mensagem de sucesso.

---

## Tratamento de Erros de Autenticação (401 Unauthorized)

Quando uma requisição a um endpoint protegido falha, a API retorna uma das seguintes mensagens de erro para facilitar o tratamento no frontend:

| Mensagem | Causa Provável |
| --- | --- |
| `Token de acesso é obrigatório` | O header `Authorization` com o Bearer token não foi enviado. |
| `Token de acesso expirado` | O `access_token` enviado ultrapassou seu tempo de vida (ex: 15 minutos). |
| `Token de acesso inválido` | O token está malformado, com assinatura incorreta ou qualquer outro erro de validação. |
| `Token de acesso revogado` | O token é válido, mas sua versão (`tokenVersion`) não corresponde à do usuário no banco, indicando que um logout ou troca de senha ocorreu. |
| `Usuário associado ao token não foi encontrado` | O usuário referenciado no token foi deletado do sistema. |

---

## Guia de Integração Frontend (Fluxo de Tokens)

O fluxo recomendado permanece o mesmo: use o `access_token` para chamadas de API e o `refresh_token` para obter um novo `access_token` quando receber um erro `401 Unauthorized` com a mensagem `Token de acesso expirado`.
