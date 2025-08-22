# Documentação da API de Artigos

Esta documentação descreve os endpoints da API necessários para o gerenciamento de artigos no site.

## Modelo de Dados: Artigo

O objeto `Artigo` representa uma notícia ou artigo no sistema.

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `id` | `number` | Identificador único do artigo. | Sim (na resposta) |
| `titulo` | `string` | Título do artigo. | Sim |
| `conteudo` | `string` | Conteúdo completo do artigo em formato HTML ou Markdown. | Sim |
| `resumo` | `string` | Um breve resumo do artigo. | Sim |
| `autor` | `string` | Nome do autor do artigo. | Sim |
| `categoria` | `string` | Categoria do artigo (ex: "Cuidados", "Nutrição", "Saúde"). | Sim |
| `status` | `string` | Status do artigo (`publicado`, `rascunho`, `revisao`). | Sim |
| `dataPublicacao` | `string` | Data de publicação no formato ISO 8601 (ex: "2024-01-15T10:00:00Z"). | Sim |
| `imagemCapa` | `string` | URL da imagem de capa do artigo. | Não |
| `visualizacoes` | `number` | Número de visualizações do artigo. | Sim (na resposta) |
| `curtidas` | `number` | Número de curtidas do artigo. | Sim (na resposta) |
| `comentarios` | `number` | Número de comentários no artigo. | Sim (na resposta) |
| `destaque` | `boolean` | Indica se o artigo está em destaque. | Sim |
| `tags` | `string[]` | Uma lista de tags associadas ao artigo. | Não |

## Endpoints da API

### 1. Listar todos os artigos

- **Endpoint:** `GET /api/artigos`
- **Descrição:** Retorna uma lista de todos os artigos.
- **Parâmetros de Query (Opcionais):**
  - `q`: Busca por título ou autor.
  - `categoria`: Filtra por categoria.
  - `status`: Filtra por status.
  - `sort`: Ordena os resultados (ex: `dataPublicacao:desc`).
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Como Cuidar do Seu Cão no Inverno",
      "autor": "Dr. Maria Silva",
      "categoria": "Cuidados",
      "status": "publicado",
      "dataPublicacao": "2024-01-15T10:00:00Z",
      "visualizacoes": 1250,
      "curtidas": 89,
      "comentarios": 23,
      "destaque": true
    }
  ]
  ```

### 2. Obter um artigo específico

- **Endpoint:** `GET /api/artigos/{id}`
- **Descrição:** Retorna os detalhes de um artigo específico.
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "id": 1,
    "titulo": "Como Cuidar do Seu Cão no Inverno",
    "conteudo": "<p>Conteúdo completo do artigo...</p>",
    "resumo": "Um resumo do artigo...",
    "autor": "Dr. Maria Silva",
    "categoria": "Cuidados",
    "status": "publicado",
    "dataPublicacao": "2024-01-15T10:00:00Z",
    "imagemCapa": "https://example.com/imagem.jpg",
    "visualizacoes": 1250,
    "curtidas": 89,
    "comentarios": 23,
    "destaque": true,
    "tags": ["cães", "inverno", "cuidados"]
  }
  ```
- **Resposta de Erro (404 Not Found):** Se o artigo não for encontrado.

### 3. Criar um novo artigo

- **Endpoint:** `POST /api/artigos`
- **Descrição:** Cria um novo artigo.
- **Corpo da Requisição:**
  ```json
  {
    "titulo": "Novo Artigo",
    "conteudo": "<p>Conteúdo do novo artigo.</p>",
    "resumo": "Resumo do novo artigo.",
    "autor": "Novo Autor",
    "categoria": "Saúde",
    "status": "rascunho",
    "destaque": false,
    "tags": ["novo", "artigo"]
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o artigo recém-criado.

### 4. Atualizar um artigo

- **Endpoint:** `PUT /api/artigos/{id}`
- **Descrição:** Atualiza um artigo existente.
- **Corpo da Requisição:** Um objeto `Artigo` completo.
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado.

### 5. Atualizar parcialmente um artigo

- **Endpoint:** `PATCH /api/artigos/{id}`
- **Descrição:** Atualiza parcialmente um artigo. Útil para alterar o status ou o destaque.
- **Corpo da Requisição:**
  ```json
  {
    "destaque": true
  }
  ```
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado.

### 6. Excluir um artigo

- **Endpoint:** `DELETE /api/artigos/{id}`
- **Descrição:** Exclui um artigo.
- **Resposta de Sucesso (204 No Content):** Nenhum conteúdo.
