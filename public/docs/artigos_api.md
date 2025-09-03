# Documentação da API de Artigos

Esta documentação descreve os endpoints da API para o gerenciamento de artigos.

**Prefixo da Rota:** `/artigos`

**Autenticação:** Endpoints marcados com 🔒 requerem autenticação via Bearer Token (JWT) e permissões de acesso específicas (ADMIN ou EDITOR).

---

## Modelo de Dados: Artigo

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `artigoId` | `string` | Identificador único do artigo (UUID). | Sim (na resposta) |
| `titulo` | `string` | Título do artigo. | Sim |
| `conteudo` | `object` | Conteúdo do artigo em formato JSON (TipTap). | Sim |
| `resumo` | `string` | Um breve resumo do artigo. | Não |
| `autorId` | `string` | ID do usuário autor. | Sim |
| `categoria` | `CategoriaArtigo` | Categoria do artigo. Valores possíveis: `NUTRICAO`, `CUIDADOS`, `SAUDE`, `COMPORTAMENTO`, `TREINAMENTO`, `RACAS`, `NOTICIAS`, `OUTROS`. | Sim |
| `status` | `StatusArtigo` | Status do artigo (`PUBLICADO`, `RASCUNHO`, `REVISAO`). | Sim |
| `dataPublicacao` | `string` | Data de publicação no formato ISO 8601. | Sim |
| `imagemCapa` | `string` | URL da imagem de destaque. | Sim |
| `visualizacoes` | `number` | Número de visualizações. | Sim (na resposta) |
| `curtidas` | `number` | Número de curtidas. | Sim (na resposta) |
| `destaque` | `boolean` | Indica se o artigo está em destaque. | Sim |
| `tags` | `string[]` | Lista de tags associadas. | Não |
| `createdAt` | `string` | Data de criação. | Sim (na resposta) |
| `updatedAt` | `string` | Data da última atualização. | Sim (na resposta) |

---

## Endpoints da API

### 1. 🔒 Criar Novo Artigo

- **Endpoint:** `POST /artigos`
- **Descrição:** Cria um novo artigo. Requer role de `ADMIN` ou `EDITOR`.
- **Corpo da Requisição:** `CreateArtigoDto`
  ```json
  {
    "titulo": "Novo Artigo sobre Gatos",
    "conteudo": { "type": "doc", "content": [...] },
    "resumo": "Um resumo opcional.",
    "autorId": "user-uuid-123",
    "categoria": "SAUDE",
    "status": "RASCUNHO",
    "imagemCapa": "https://example.com/imagem.jpg",
    "destaque": false,
    "tags": ["gatos", "cuidados"]
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o artigo recém-criado.
- **Respostas de Erro:**
    - `400 Bad Request`: Dados inválidos.
    - `401 Unauthorized`: Token JWT inválido ou ausente.
    - `403 Forbidden`: O usuário não tem a role necessária.

### 2. 🔒 Listar Todos os Artigos (Admin)

- **Endpoint:** `GET /artigos`
- **Descrição:** Retorna uma lista paginada de todos os artigos para gerenciamento. Requer role de `ADMIN` ou `EDITOR`.
- **Parâmetros de Query:** `ListArtigosDto` (page, limit, q, status, categoria, sort)
- **Resposta de Sucesso (200 OK):** `ArtigosListResponseDto`

### 3. Listar Artigos Publicados (Público)

- **Endpoint:** `GET /artigos/publicados`
- **Descrição:** Retorna uma lista paginada de artigos com status `PUBLICADO`.
- **Parâmetros de Query:** `ListArtigosDto` (page, limit, q, categoria, sort)
- **Resposta de Sucesso (200 OK):** `ArtigosListResponseDto`

### 4. Listar Artigos em Destaque (Público)

- **Endpoint:** `GET /artigos/destaques`
- **Descrição:** Retorna uma lista dos artigos em destaque.
- **Parâmetros de Query:**
    - `limit` (opcional): Número máximo de artigos a serem retornados. Padrão: `5`.
- **Resposta de Sucesso (200 OK):** `ArtigoResponseDto[]`

### 5. Obter Artigo por ID

- **Endpoint:** `GET /artigos/{id}`
- **Descrição:** Retorna os detalhes de um artigo específico.
- **Parâmetros de Query:**
    - `incrementView` (opcional): Se `true`, incrementa o contador de visualizações.
- **Resposta de Sucesso (200 OK):** `ArtigoResponseDto`
- **Resposta de Erro (404 Not Found):** Se o artigo não for encontrado.

### 6. 🔒 Atualizar Artigo

- **Endpoint:** `PATCH /artigos/{id}`
- **Descrição:** Atualiza parcialmente um artigo existente. Requer role de `ADMIN` ou `EDITOR`.
- **Corpo da Requisição:** `UpdateArtigoDto` (todos os campos são opcionais)
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado.
- **Respostas de Erro:** `400`, `401`, `403`, `404`.

### 7. 🔒 Excluir Artigo

- **Endpoint:** `DELETE /artigos/{id}`
- **Descrição:** Exclui um artigo. Requer role de `ADMIN` ou `EDITOR`.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "message": "Artigo excluído com sucesso"
  }
  ```
- **Respostas de Erro:** `401`, `403`, `404`.

### 8. Curtir Artigo

- **Endpoint:** `POST /artigos/{id}/curtir`
- **Descrição:** Incrementa o contador de curtidas de um artigo.
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado com o novo número de curtidas.
- **Respostas de Erro:** `404`.

### 9. Descurtir Artigo

- **Endpoint:** `POST /artigos/{id}/descurtir`
- **Descrição:** Decrementa o contador de curtidas de um artigo.
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado.
- **Respostas de Erro:** `404`.

---

## Endpoint de Upload de Imagens

### 1. 🔒 Upload de Imagem para Artigo

- **Endpoint:** `POST /artigos/imagens/upload`
- **Descrição:** Recebe um arquivo de imagem, salva-o e retorna a URL pública. Requer role de `ADMIN` ou `EDITOR`.
- **Corpo da Requisição:** `multipart/form-data` com um campo `image`.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "url": "https://example.com/uploads/artigos/nome_da_imagem_12345.jpg"
  }
  ```
- **Respostas de Erro:** `400`, `401`, `403`.
