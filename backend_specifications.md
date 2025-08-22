
# Especificações do Backend

Este documento descreve as especificações do backend necessárias para suportar as funcionalidades do frontend do projeto Revista Dog & Cat.

## Autenticação

A autenticação será baseada em tokens (JWT).

### Endpoints

*   **`POST /api/auth/login`**: Autenticar um usuário.
    *   **Request body**:
        ```json
        {
          "identification": "user@example.com",
          "password": "password123"
        }
        ```
    *   **Response (success)**:
        ```json
        {
          "token": "jwt_token",
          "user": {
            "id": 1,
            "name": "João Silva",
            "email": "user@example.com",
            "role": "admin"
          }
        }
        ```
    *   **Response (error)**: `401 Unauthorized`

*   **`POST /api/auth/register`**: Registrar um novo usuário.
    *   **Request body**:
        ```json
        {
          "email": "newuser@example.com",
          "password": "new_password"
        }
        ```
    *   **Response (success)**: `201 Created`
    *   **Response (error)**: `400 Bad Request` (e.g., email já existe)

*   **`POST /api/auth/request-password-reset`**: Solicitar a redefinição de senha.
    *   **Request body**:
        ```json
        {
          "email": "user@example.com"
        }
        ```
    *   **Response (success)**: `200 OK` (um email com o link de redefinição de senha será enviado)
    *   **Response (error)**: `404 Not Found` (email não encontrado)

*   **`POST /api/auth/reset-password`**: Redefinir a senha.
    *   **Request body**:
        ```json
        {
          "token": "reset_token",
          "password": "new_password"
        }
        ```
    *   **Response (success)**: `200 OK`
    *   **Response (error)**: `400 Bad Request` (e.g., token inválido ou expirado)

## Cadastro de Cães (Expo Dog BR)

### Endpoints

*   **`POST /api/expo-dog/registrations`**: Registrar um novo cão na Expo Dog BR.
    *   **Request body**: `multipart/form-data` contendo:
        *   `ownerData`: JSON string com os dados do proprietário (nome, cpf, email, telefone, endereço).
        *   `dogData`: JSON string com os dados do cão (nome, raça, sexo, data de nascimento, etc.).
        *   `videoData`: JSON string com os dados do vídeo (opção de envio, URL do YouTube, etc.).
        *   `videoFile` (opcional): O arquivo de vídeo, se a opção de upload for escolhida.
    *   **Response (success)**: `201 Created`
    *   **Response (error)**: `400 Bad Request`

*   **`GET /api/expo-dog/winner`**: Obter o cão vencedor da Expo Dog BR.
    *   **Response (success)**:
        ```json
        {
          "dogName": "Nome do Cão Vencedor",
          "breed": "Raça do Cão",
          "ownerName": "Nome do Proprietário",
          "location": "Cidade - UF",
          "imageUrl": "url_da_imagem_do_cao"
        }
        ```

## Anunciantes

### Endpoints

*   **`POST /api/advertisers`**: Registrar um novo anunciante.
    *   **Request body**:
        ```json
        {
          "name": "Nome do Anunciante",
          "email": "anunciante@example.com",
          "phone": "11999999999",
          "company": "Nome da Empresa",
          "adType": "Tipo de Anúncio",
          "message": "Mensagem opcional"
        }
        ```
    *   **Response (success)**: `201 Created`
    *   **Response (error)**: `400 Bad Request`

## Painel de Administração

### Artigos

*   **`GET /api/admin/articles`**: Obter uma lista de todos os artigos.
    *   **Query params (opcional)**: `page`, `limit`, `status`, `category`, `search`
    *   **Response (success)**:
        ```json
        {
          "articles": [
            {
              "id": 1,
              "title": "Título do Artigo",
              "author": "Nome do Autor",
              "category": "Categoria",
              "status": "publicado",
              "publicationDate": "2024-01-01",
              "views": 1000,
              "likes": 50,
              "comments": 10,
              "featured": true
            }
          ],
          "totalPages": 10,
          "currentPage": 1
        }
        ```

*   **`GET /api/admin/articles/:id`**: Obter os detalhes de um artigo específico.
    *   **Response (success)**: (mesmo formato do objeto de artigo acima, mas com o campo `content`)

*   **`POST /api/admin/articles`**: Criar um novo artigo.
    *   **Request body**: (objeto de artigo sem os campos de estatísticas)
    *   **Response (success)**: `201 Created`

*   **`PUT /api/admin/articles/:id`**: Atualizar um artigo existente.
    *   **Request body**: (objeto de artigo com os campos a serem atualizados)
    *   **Response (success)**: `200 OK`

*   **`DELETE /api/admin/articles/:id`**: Excluir um artigo.
    *   **Response (success)**: `204 No Content`

*   **`GET /api/admin/authors`**: Obter a lista de autores.
    *   **Response (success)**:
        ```json
        [
          { "id": 1, "name": "Autor 1" },
          { "id": 2, "name": "Autor 2" }
        ]
        ```

*   **`GET /api/admin/categories`**: Obter a lista de categorias.
    *   **Response (success)**:
        ```json
        [
          { "id": 1, "name": "Categoria 1" },
          { "id": 2, "name": "Categoria 2" }
        ]
        ```

### Usuários

*   **`GET /api/admin/users`**: Obter uma lista de todos os usuários.
    *   **Query params (opcional)**: `page`, `limit`, `role`, `status`, `search`
    *   **Response (success)**:
        ```json
        {
          "users": [
            {
              "id": 1,
              "name": "Nome do Usuário",
              "email": "usuario@example.com",
              "role": "admin",
              "status": "ativo",
              "registrationDate": "2024-01-01",
              "lastAccess": "2024-08-21"
            }
          ],
          "totalPages": 5,
          "currentPage": 1
        }
        ```

*   **`POST /api/admin/users`**: Criar um novo usuário.
    *   **Request body**: (objeto de usuário sem o ID e datas)
    *   **Response (success)**: `201 Created`

*   **`PUT /api/admin/users/:id`**: Atualizar um usuário existente.
    *   **Request body**: (objeto de usuário com os campos a serem atualizados)
    *   **Response (success)**: `200 OK`

*   **`DELETE /api/admin/users/:id`**: Excluir um usuário.
    *   **Response (success)**: `204 No Content`

### Dashboard

*   **`GET /api/admin/dashboard/stats`**: Obter as estatísticas do dashboard.
    *   **Response (success)**:
        ```json
        {
          "totalUsers": 1234,
          "publishedArticles": 89,
          "activeSubscribers": 567,
          "totalViews": 12500
        }
        ```

*   **`GET /api/admin/dashboard/recent-activity`**: Obter a atividade recente.
    *   **Response (success)**:
        ```json
        [
          {
            "type": "new_user",
            "description": "Novo usuário cadastrado: João Silva",
            "timestamp": "2024-08-22T10:00:00Z"
          },
          {
            "type": "new_article",
            "description": "Artigo publicado: Cuidados com Pets no Inverno",
            "timestamp": "2024-08-22T09:00:00Z"
          }
        ]
        ```
