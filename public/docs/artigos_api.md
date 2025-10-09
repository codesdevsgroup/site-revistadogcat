# Documentação da API de Artigos

Este documento descreve os endpoints públicos e administrativos relacionados a artigos.

Base path: /artigos

Autenticação: Endpoints marcados com 🔒 exigem Bearer Token (JWT) e roles ADMIN ou EDITOR.

---

## Modelo de Resposta

ArtigoResponseDto
- artigoId: string
- titulo: string
- conteudo: object (JSON TipTap)
- resumo?: string
- autor: { userId: string; name: string; avatarUrl?: string }
- categoria: CategoriaArtigo
- status: StatusArtigo
- dataPublicacao: Date (ISO)
- imagemCapa: string (URL)
- visualizacoes: number
- curtidas: number
- comentarios: ComentarioResponseDto[]
- destaque: boolean
- tags: string[]
- createdAt: Date
- updatedAt: Date

ArtigosListResponseDto
- data: ArtigoResponseDto[]
- pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

---

## Parâmetros de Lista (ListArtigosDto)

Usados nos endpoints de listagem:
- page?: string (padrão: "1")
- limit?: string (padrão: "10", máximo: 50)
- search?: string (busca por título/conteúdo)
- categoria?: string
- status?: StatusArtigo
- destaque?: boolean (enviar "true" para filtrar destaque)
- tag?: string
- sortBy?: string (padrão: "dataPublicacao"; opções: dataPublicacao, visualizacoes, curtidas, createdAt, titulo)
- sortOrder?: "asc" | "desc" (padrão: "desc")

---

## Endpoints

### 1) 🔒 POST /artigos
Cria um novo artigo.

Body (CreateArtigoDto):
- titulo: string
- conteudo: object (JSON TipTap)
- resumo?: string
- autorId: string (UUID)
- categoria: CategoriaArtigo
- status?: StatusArtigo (default: RASCUNHO)
- dataPublicacao: string (ISO)
- imagemCapa: string (URL)
- destaque?: boolean
- tags?: string[]

Respostas: 201 (ArtigoResponseDto), 400, 401, 403

### 2) 🔒 GET /artigos
Lista paginada de todos os artigos (admin/editor).

Query: ListArtigosDto
Resposta: 200 (ArtigosListResponseDto)

### 3) GET /artigos/publicados
Lista paginada de artigos com status PUBLICADO (público).

Query: ListArtigosDto (page, limit, search, categoria, destaque, tag, sortBy, sortOrder)
Resposta: 200 (ArtigosListResponseDto)

Exemplo:
GET /artigos/publicados?sortBy=dataPublicacao&sortOrder=desc&page=1&limit=10

### 4) GET /artigos/destaques
Lista artigos em destaque (público).

Query:
- limit?: string (padrão: "5")

Resposta: 200 (ArtigoResponseDto[])

### 5) GET /artigos/{id}
Obtém um artigo por ID.

Query:
- incrementView?: string ("true" para incrementar visualizações)

Respostas: 200 (ArtigoResponseDto), 404

### 6) 🔒 PATCH /artigos/{id}
Atualiza parcialmente um artigo.

Body: UpdateArtigoDto (todos os campos opcionais)
Respostas: 200 (ArtigoResponseDto), 400, 401, 403, 404

### 7) 🔒 DELETE /artigos/{id}
Remove (soft delete) um artigo.

Resposta: 200 { message: "Artigo excluído com sucesso" }, 401, 403, 404

### 8) POST /artigos/{id}/curtir
Incrementa curtidas de um artigo publicado.

Resposta: 200 (ArtigoResponseDto), 404

### 9) POST /artigos/{id}/descurtir
Decrementa curtidas de um artigo publicado.

Resposta: 200 (ArtigoResponseDto), 404

### 10) Comentários

- GET /artigos/{id}/comentarios (público)
- 🔒 POST /artigos/{id}/comentarios (JWT)
  - Body: { conteudo: string }
- 🔒 PATCH /artigos/comentarios/{comentarioId} (JWT)
- 🔒 DELETE /artigos/comentarios/{comentarioId} (JWT)

### 11) 🔒 POST /artigos/imagens/upload
Upload de imagem (multipart/form-data, campo "image"). Retorna URL pública.

Respostas: 200 { url: string }, 400, 401, 403

---

## Observações para Integração Frontend
- Em páginas públicas, utilize GET /artigos/publicados com sortBy e sortOrder; leia response.data e response.pagination.
- Em páginas de administração, utilize GET /artigos com Authorization: Bearer <token>.
- CORS está habilitado para http://localhost:4200 e origens relacionadas no backend.
 - Quando a lista estiver vazia (após aplicar filtros/paginação), a resposta terá `data: []` e a mensagem: "Nenhum artigo cadastrado".