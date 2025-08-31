# Documentação da API de Artigos

Esta documentação descreve os endpoints da API para o gerenciamento de artigos, alinhada com as necessidades do painel de administração.

**Prefixo da Rota:** `/artigos`

**Autenticação:** Endpoints marcados com 🔒 requerem autenticação via Bearer Token (JWT) e permissões de acesso específicas (ADMIN ou EDITOR).

---

## Modelo de Dados: Artigo

Este é o modelo de dados completo para a entidade `Artigo`.

| Campo | Tipo | Descrição | Obrigatório na Criação |
| --- | --- | --- | --- |
| `id` | `string` | Identificador único do artigo (UUID). | Não (gerado pelo servidor) |
| `titulo` | `string` | Título principal do artigo. | Sim |
| `conteudo` | `object` | Conteúdo do artigo em formato JSON (padrão TipTap). | Sim |
| `autor` | `object` | Objeto contendo `{ id: string, nome: string }` do autor. | Sim (enviar `autorId`) |
| `categoria` | `object` | Objeto contendo `{ id: string, nome: string }` da categoria. | Sim (enviar `categoriaId`) |
| `status` | `string` | Status do artigo. Valores: `RASCUNHO`, `REVISAO`, `PUBLICADO`, `ARQUIVADO`. | Sim |
| `publico` | `string` | Nível de acesso. Valores: `PUBLICO`, `ASSINANTES`, `PRIVADO`. | Sim |
| `dataPublicacao` | `string` | Data de publicação no formato ISO 8601 (`YYYY-MM-DD`). | Sim |
| `fotoDestaqueUrl` | `string` | URL da imagem de destaque do artigo. | Sim |
| `destaque` | `boolean` | Indica se o artigo está em destaque na home. | Não (padrão: `false`) |
| `visualizacoes` | `number` | Contagem de visualizações (gerenciado pelo servidor). | Não |
| `curtidas` | `number` | Contagem de curtidas (gerenciado pelo servidor). | Não |
| `comentarios` | `number` | Contagem de comentários (gerenciado pelo servidor). | Não |
| `createdAt` | `string` | Data de criação (gerado pelo servidor). | Não |
| `updatedAt` | `string` | Data da última atualização (gerado pelo servidor). | Não |

---

## Modelo de Dados: Categoria

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `string` | Identificador único da categoria (UUID). |
| `nome` | `string` | Nome de exibição da categoria (ex: "Saúde & Bem-estar"). |
| `slug` | `string` | Versão amigável para URL (ex: "saude-e-bem-estar"). |

### Categorias Sugeridas para Pets

- Saúde & Bem-estar
- Alimentação & Nutrição
- Comportamento & Treinamento
- Cuidados & Higiene
- Raças & Guias
- Notícias & Eventos
- Adoção & Resgate
- Produtos & Acessórios

---

## Endpoints da API

### 1. 🔒 Criar Novo Artigo

- **Endpoint:** `POST /artigos`
- **Descrição:** Cria um novo artigo.
- **Corpo da Requisição:**
  ```json
  {
    "titulo": "Como Cuidar da Saúde do seu Pet",
    "conteudo": { "type": "doc", "content": [...] },
    "autorId": "user-uuid-123",
    "categoriaId": "category-uuid-456",
    "status": "RASCUNHO",
    "publico": "PUBLICO",
    "dataPublicacao": "2024-08-31",
    "fotoDestaqueUrl": "https://example.com/imagem.jpg",
    "destaque": false
  }
  ```
- **Resposta de Sucesso (201 Created):** Retorna o objeto completo do artigo recém-criado.

### 2. 🔒 Listar Todos os Artigos (para o Painel)

- **Endpoint:** `GET /artigos`
- **Descrição:** Retorna uma lista paginada de todos os artigos para o painel de gerenciamento.
- **Parâmetros de Query (Opcionais):**
  - `page`: Número da página (padrão: 1).
  - `limit`: Itens por página (padrão: 10).
  - `q`: Termo de busca para o título.
  - `status`: Filtrar por status (`RASCUNHO`, `PUBLICADO`, etc.).
  - `categoriaId`: Filtrar por ID da categoria.
- **Resposta de Sucesso (200 OK):** Retorna um objeto de paginação contendo um array de artigos. Cada artigo na lista deve incluir os campos necessários para a tabela, como `autor.nome` e `categoria.nome`.

### 3. 🔒 Obter Artigo por ID

- **Endpoint:** `GET /artigos/{id}`
- **Descrição:** Retorna os detalhes completos de um artigo específico para preencher o formulário de edição.
- **Resposta de Sucesso (200 OK):** Retorna o objeto completo do artigo.
- **Resposta de Erro (404 Not Found):** Se o artigo não for encontrado.

### 4. 🔒 Atualizar Artigo

- **Endpoint:** `PATCH /artigos/{id}`
- **Descrição:** Atualiza parcialmente um artigo existente. Enviar apenas os campos que foram modificados.
- **Corpo da Requisição:** (Exemplo: atualizando o título e o status)
  ```json
  {
    "titulo": "Título Atualizado do Artigo",
    "status": "PUBLICADO"
  }
  ```
- **Resposta de Sucesso (200 OK):** Retorna o objeto completo do artigo atualizado.

### 5. 🔒 Excluir Artigo

- **Endpoint:** `DELETE /artigos/{id}`
- **Descrição:** Exclui um artigo de forma lógica (soft delete).
- **Resposta de Sucesso (204 No Content):** Resposta vazia indicando sucesso.

### 6. 🔒 Alternar Destaque

- **Endpoint:** `PATCH /artigos/{id}/destaque`
- **Descrição:** Alterna o status de `destaque` de um artigo.
- **Corpo da Requisição:**
  ```json
  {
    "destaque": true
  }
  ```
- **Resposta de Sucesso (200 OK):** Retorna o artigo atualizado.

### 7. Listar Categorias

- **Endpoint:** `GET /categorias`
- **Descrição:** Retorna uma lista de todas as categorias disponíveis para preencher seletores no frontend.
- **Resposta de Sucesso (200 OK):**
  ```json
  [
    { "id": "uuid-1", "nome": "Saúde & Bem-estar", "slug": "saude-e-bem-estar" },
    { "id": "uuid-2", "nome": "Alimentação & Nutrição", "slug": "alimentacao-e-nutricao" }
  ]
  ```
