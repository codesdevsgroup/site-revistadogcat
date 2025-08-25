# Documentação da API de Artigos

Esta documentação descreve os endpoints da API necessários para o gerenciamento de artigos e seus assets no site.

## Modelo de Dados: Artigo

O objeto `Artigo` representa uma notícia ou artigo no sistema.

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `id` | `number` | Identificador único do artigo. | Sim (na resposta) |
| `titulo` | `string` | Título do artigo. | Sim |
| `conteudo` | `object` | Conteúdo do artigo em formato JSON, gerado pelo editor TipTap. | Sim |
| `resumo` | `string` | Um breve resumo do artigo. | Não |
| `autor` | `string` | Nome do autor do artigo. | Sim |
| `categoria` | `string` | Categoria do artigo (ex: "Cuidados", "Nutrição", "Saúde"). | Sim |
| `status` | `string` | Status do artigo (`publicado`, `rascunho`, `revisao`). | Sim |
| `dataPublicacao` | `string` | Data de publicação no formato ISO 8601 (ex: "2024-01-15T10:00:00Z"). | Sim |
| `imagemCapa` | `string` | URL da foto de destaque do artigo. | Sim |
| `visualizacoes` | `number` | Número de visualizações do artigo. | Sim (na resposta) |
| `curtidas` | `number` | Número de curtidas do artigo. | Sim (na resposta) |
| `comentarios` | `number` | Número de comentários no artigo. | Sim (na resposta) |
| `destaque` | `boolean` | Indica se o artigo está em destaque. | Sim |
| `tags` | `string[]` | Uma lista de tags associadas ao artigo. | Não |

## Endpoints da API de Artigos

### 1. Listar todos os artigos

- **Endpoint:** `GET /api/artigos`
- **Descrição:** Retorna uma lista de todos os artigos.
- **Parâmetros de Query (Opcionais):**
  - `q`: Busca por título ou autor.
  - `categoria`: Filtra por categoria.
  - `status`: Filtra por status.
  - `sort`: Ordena os resultados (ex: `dataPublicacao:desc`).
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Como Cuidar do Seu Cão no Inverno",
      "autor": "Dr. Maria Silva",
      "categoria": "Cuidados",
      "status": "publicado",
      "dataPublicacao": "2024-01-15T10:00:00Z",
      "imagemCapa": "https://example.com/imagem.jpg",
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
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  {
    "id": 1,
    "titulo": "Como Cuidar do Seu Cão no Inverno",
    "conteudo": {
      "type": "doc",
      "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Conteúdo inicial do artigo..."}]},
        {
          "type": "image",
          "attrs": {
            "src": "https://example.com/uploads/imagem_1.jpg",
            "alt": "Cão brincando na neve."
          }
        },
        {"type": "paragraph", "content": [{"type": "text", "text": "Mais texto sobre o assunto."}]},
        {
          "type": "image",
          "attrs": {
            "src": "https://example.com/uploads/imagem_2.jpg",
            "alt": "Outra foto do cão."
          }
        }
      ]
    },
    "resumo": "Um resumo do artigo...",
    "autor": "Dr. Maria Silva",
    "categoria": "Cuidados",
    "status": "publicado",
    "dataPublicacao": "2024-01-15T10:00:00Z",
    "imagemCapa": "https://example.com/imagem_capa.jpg",
    "visualizacoes": 1250,
    "curtidas": 89,
    "comentarios": 23,
    "destaque": true,
    "tags": ["cães", "inverno", "cuidados"]
  }
  ```
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o artigo não for encontrado.

### 3. Criar um novo artigo

- **Endpoint:** `POST /api/artigos`
- **Descrição:** Cria um novo artigo.
- **Corpo da Requisição:**
  ```json
  {
    "titulo": "Novo Artigo",
    "conteudo": {
      "type": "doc",
      "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Conteúdo do novo artigo."}]}]
    },
    "resumo": "Resumo do novo artigo (opcional).",
    "autor": "Novo Autor",
    "categoria": "Saúde",
    "status": "rascunho",
    "imagemCapa": "https://example.com/imagem_destaque.jpg",
    "destaque": false,
    "tags": ["novo", "artigo"]
  }
  ```
- **Resposta de Sucesso (201 Created - E você jurando que não ia dar certo.):** Retorna o artigo recém-criado.
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se os dados fornecidos forem inválidos.

**Exemplo de artigo sem resumo (campo opcional):**
```json
{
  "titulo": "Dicas de Adestramento para Filhotes",
  "conteudo": {
    "type": "doc",
    "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Conteúdo sobre adestramento de filhotes..."}]}]
  },
  "autor": "Especialista em Comportamento",
  "categoria": "Comportamento",
  "status": "publicado",
  "imagemCapa": "https://example.com/filhote_adestramento.jpg",
  "destaque": true,
  "tags": ["adestramento", "filhotes", "comportamento"]
}
```

### 4. Atualizar um artigo

- **Endpoint:** `PUT /api/artigos/{id}`
- **Descrição:** Atualiza um artigo existente.
- **Corpo da Requisição:** Um objeto `Artigo` completo.
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):** Retorna o artigo atualizado.
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se os dados fornecidos forem inválidos.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o artigo não for encontrado.

### 5. Atualizar parcialmente um artigo

- **Endpoint:** `PATCH /api/artigos/{id}`
- **Descrição:** Atualiza parcialmente um artigo. Útil para alterar o status ou o destaque.
- **Corpo da Requisição:**
  ```json
  {
    "destaque": true
  }
  ```
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):** Retorna o artigo atualizado.
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se os dados fornecidos forem inválidos.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o artigo não for encontrado.

### 6. Excluir um artigo

- **Endpoint:** `DELETE /api/artigos/{id}`
- **Descrição:** Exclui um artigo.
- **Resposta de Sucesso (204 No Content - OK, mas sem resposta... tipo ghosting.):** Nenhum conteúdo.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o artigo não for encontrado.

## Endpoint de Upload de Imagens

### 1. Upload de Imagem

- **Endpoint:** `POST /api/imagens/upload`
- **Descrição:** Recebe um arquivo de imagem, salva-o e retorna a URL pública.
- **Corpo da Requisição:** `multipart/form-data` com um campo `image` contendo o arquivo.
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  {
    "url": "https://example.com/uploads/nome_da_imagem_12345.jpg"
  }
  ```
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se nenhum arquivo for enviado ou se o tipo de arquivo não for suportado.

- **Notas de Uso:**
  - Para adicionar **múltiplas imagens** ao conteúdo de um artigo, o front-end deve chamar este endpoint **uma vez para cada imagem**.
  - Após cada chamada bem-sucedida, o front-end deve pegar a `url` retornada e inseri-la em um nó do tipo `image` dentro do JSON do campo `conteudo` do artigo.
  - A `imagemCapa` do artigo também deve ser enviada por este endpoint para obter uma URL antes de ser associada ao artigo.
