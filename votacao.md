# Documentação da API de Votação

Esta documentação descreve as rotas, fluxo de votação, regras de negócio e o endpoint de atualizações em tempo real via SSE do módulo de Votação.

## Visão Geral

- Os votos são separados por tipo: `COMUM` e `SUPER`.
- Cada usuário só pode votar uma vez por tipo em cada cão.
- O ranking do cão utiliza o campo `totalVotos` (incrementado/decrementado a cada voto/remoção).
- Atualizações em tempo real do total de votos são fornecidas via SSE em `GET /votacao/stream`.

## Autenticação e Segurança

- A maioria das rotas de votação requer JWT:
  - Envie o header `Authorization: Bearer <token>`.
- O endpoint SSE também exige JWT.
- Rate limiting e headers de segurança devem ser aplicados globalmente (configuração do projeto).

## Enums e Modelos Relevantes

- Enum `VotoTipo` (Prisma):
  - `COMUM`
  - `SUPER`

- Saldos por usuário (User):
  - `votosDisponiveisComum`, `votosUtilizadosComum`
  - `votosDisponiveisSuper`, `votosUtilizadosSuper`

- Cadastro do cão (CadastroCao):
  - `totalVotos` (contador total para ranking)

## Endpoints

Base: `/votacao`

### 1) POST /votacao/votar (JWT)

- Objetivo: Registrar um voto de um usuário em um cão.
- Body (CreateVotoDto):
  ```json
  {
    "cadastroId": "string",
    "tipo": "COMUM" | "SUPER"
  }
  ```
- Respostas:
  - 201 OK
    ```json
    {
      "votoId": "string",
      "userId": "string",
      "cadastroId": "string",
      "tipo": "COMUM",
      "createdAt": "2025-11-06T12:34:56.000Z",
      "ip": "198.51.100.23"
    }
    ```
  - 400 Bad Request: sem votos disponíveis, já votou, autovoto, cadastro inativo
  - 403 Forbidden: usuário bloqueado/inativo
  - 404 Not Found: usuário/cadastro não encontrado

### 2) DELETE /votacao/remover/:cadastroId (JWT)

- Objetivo: Remover o voto do usuário para um cão específico.
- Query:
  - `tipo` (obrigatório) = `COMUM` | `SUPER`
- Respostas:
  - 204 No Content
  - 404 Not Found: voto não encontrado

### 3) GET /votacao/meus-votos (JWT)

- Objetivo: Listar todos os votos do usuário autenticado.
- Resposta 200:
  ```json
  [
    {
      "votoId": "string",
      "userId": "string",
      "cadastroId": "string",
      "tipo": "SUPER",
      "createdAt": "2025-11-06T12:34:56.000Z",
      "ip": "198.51.100.23"
    }
  ]
  ```

### 4) GET /votacao/estatisticas

- Objetivo: Estatísticas agregadas de votação.
- Resposta 200:
  ```json
  {
    "totalVotos": 1234,
    "totalUsuariosVotaram": 321,
    "totalCaesComVotos": 57,
    "mediaVotosPorCao": 21.65,
    "caoMaisVotado": {
      "cadastroId": "string",
      "nome": "Rex",
      "totalVotos": 99
    }
  }
  ```

### 5) GET /votacao/publico/listar

- Objetivo: Lista pública e paginada de votos com filtros.
- Query (ListVotosDto):
  - `page` (número, padrão 1)
  - `limit` (número, padrão 10)
  - `userId` (string, opcional)
  - `cadastroId` (string, opcional)
  - `tipo` (COMUM|SUPER, opcional)
  - `dataInicial` (ISO, opcional)
  - `dataFinal` (ISO, opcional)
- Resposta 200:
  ```json
  {
    "votos": [
      {
        "votoId": "string",
        "userId": "string",
        "cadastroId": "string",
        "tipo": "COMUM",
        "createdAt": "2025-11-06T12:34:56.000Z",
        "ip": null
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
  ```
  - Observação: O IP é removido nesta rota pública.

### 6) GET /votacao/status-usuario (JWT)

- Objetivo: Obter o status de votos do usuário logado.
- Resposta 200:
  ```json
  {
    "votosDisponiveisComum": 10,
    "votosUtilizadosComum": 3,
    "votosDisponiveisSuper": 2,
    "votosUtilizadosSuper": 1,
    "votosRestantesComum": 7,
    "votosRestantesSuper": 1
  }
  ```

### 7) GET /votacao/verificar-voto/:cadastroId (JWT)

- Objetivo: Verificar se o usuário já votou em um cão.
- Query:
  - `tipo` (opcional) = `COMUM` | `SUPER` (se não informado, verifica qualquer tipo)
- Resposta 200:
  ```json
  {
    "jaVotou": true,
    "voto": {
      "votoId": "string",
      "userId": "string",
      "cadastroId": "string",
      "tipo": "COMUM",
      "createdAt": "2025-11-06T12:34:56.000Z",
      "ip": "198.51.100.23"
    }
  }
  ```

## SSE: Atualizações em Tempo Real

### GET /votacao/stream (JWT)

- Objetivo: Receber atualizações de ranking (totalVotos) em tempo real.
- Cabeçalhos:
  - `Accept: text/event-stream`
  - `Authorization: Bearer <token>`
- Evento enviado:
  ```json
  {
    "cadastroId": "string",
    "totalVotos": 42,
    "tipo": "COMUM",
    "timestamp": "2025-11-06T12:34:56.000Z"
  }
  ```
- Exemplo de consumo (browser):
  ```html
  <script>
    const source = new EventSource('/votacao/stream', { withCredentials: true });
    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Atualize o DOM para o cão data.cadastroId com data.totalVotos
    };
    source.onerror = () => { /* reconectar/backoff */ };
  </script>
  ```

## Regras de Negócio

- 1 voto por tipo (`COMUM`/`SUPER`) por usuário para cada cão.
- Proibido votar no próprio cão.
- Verificações de usuário ativo e não bloqueado.
- Contadores de usuário por tipo: `votosUtilizadosComum/Super` nunca podem exceder `votosDisponiveisComum/Super`.
- `totalVotos` do cão é incrementado a cada novo voto e decrementado ao remover.

## Erros Comuns

- 400 Bad Request:
  - `Usuário não possui votos comuns/super disponíveis`
  - `Usuário já votou neste cão`
  - `Cadastro de cão inativo ou removido`
  - `Não é possível votar no próprio cão`
- 403 Forbidden:
  - `Usuário inativo ou bloqueado`
- 404 Not Found:
  - `Usuário/Cadastro/Voto não encontrado`

## Notas de Implementação

- O endpoint público de listagem oculta o IP por privacidade.
- SSE é unidirecional e simplifica a infraestrutura para atualizações de ranking.
- Documentação Swagger está disponível e deve refletir estes contratos (tags: `Votação`).

## Exemplos de Uso (cURL)

- Votar (COMUM):
  ```bash
  curl -X POST https://api.exemplo.com/votacao/votar \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"cadastroId":"<id>","tipo":"COMUM"}'
  ```

- Remover voto (SUPER):
  ```bash
  curl -X DELETE "https://api.exemplo.com/votacao/remover/<cadastroId>?tipo=SUPER" \
    -H "Authorization: Bearer <token>"
  ```

- Status de votação do usuário:
  ```bash
  curl -X GET https://api.exemplo.com/votacao/status-usuario \
    -H "Authorization: Bearer <token>"
  ```

- SSE stream (via navegador ou biblioteca EventSource):
  ```bash
  curl -N -H "Accept: text/event-stream" -H "Authorization: Bearer <token>" \
    https://api.exemplo.com/votacao/stream
  ```

---

Se precisar, posso complementar esta documentação com diagramas de sequência do fluxo de votação e referências diretas aos DTOs definidos no projeto.

## Endpoints Administrativos (Auditoria e Kardex)

Base: `/kardex` (JWT + Roles ADMIN/FUNCIONARIO)

### 1) GET /kardex/listar

- Objetivo: Listar registros do histórico de ações de votação (Kardex) com filtros e paginação.
- Query (ListKardexDto):
  - `page` (número, padrão 1)
  - `limit` (número, padrão 10)
  - `userId` (string, opcional)
  - `cadastroId` (string, opcional)
  - `acao` (enum AcaoKardex: VOTO_CRIADO, VOTO_REMOVIDO, VOTO_INVALIDADO, USUARIO_BLOQUEADO, CADASTRO_DESATIVADO)
  - `dataInicial` (ISO, opcional)
  - `dataFinal` (ISO, opcional)
- Resposta 200 (KardexListResponseDto):
  ```json
  {
    "kardex": [
      {
        "kardexId": "string",
        "userId": "string",
        "cadastroId": "string",
        "acao": "VOTO_CRIADO",
        "ip": "198.51.100.23",
        "userAgent": "Mozilla/...",
        "observacoes": "Voto criado com sucesso",
        "createdAt": "2025-11-06T12:34:56.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
  ```

### 2) GET /kardex/estatisticas

- Objetivo: Estatísticas agregadas por tipo de ação do Kardex.
- Resposta 200:
  ```json
  {
    "totalRegistros": 123,
    "porAcao": [
      { "acao": "VOTO_CRIADO", "quantidade": 90 },
      { "acao": "VOTO_REMOVIDO", "quantidade": 25 },
      { "acao": "VOTO_INVALIDADO", "quantidade": 8 }
    ]
  }
  ```

### 3) GET /kardex/historico-usuario/:userId

- Objetivo: Histórico de ações de voto de um usuário (limite padrão: 50).
- Query:
  - `limite` (número, opcional)
- Resposta 200: array de registros (mesma estrutura do item listar).

### 4) GET /kardex/historico-cadastro/:cadastroId

- Objetivo: Histórico de votos recebidos por um cadastro de cão.
- Query:
  - `limite` (número, opcional)
- Resposta 200: array de registros.

### 5) GET /kardex/auditoria (ADMIN)

- Objetivo: Relatório de auditoria focado em ações administrativas (invalidar voto, bloquear usuário, desativar cadastro).
- Query:
  - `dataInicio` (ISO, opcional)
  - `dataFim` (ISO, opcional)
  - `adminUserId` (string, opcional)
- Resposta 200:
  ```json
  {
    "periodo": { "inicio": "2025-11-01T00:00:00.000Z", "fim": "2025-11-06T00:00:00.000Z" },
    "estatisticas": {
      "totalRegistros": 12,
      "porAcao": {
        "VOTO_INVALIDADO": 7,
        "USUARIO_BLOQUEADO": 3,
        "CADASTRO_DESATIVADO": 2
      },
      "porUsuario": {
        "<userId1>": 5,
        "<userId2>": 7
      }
    },
    "registros": [ /* itens do kardex filtrados por ações administrativas */ ]
  }
  ```

### 6) GET /kardex/resumo-diario

- Objetivo: Resumo por dia das ações de votação (últimos N dias, padrão 30).
- Query:
  - `dias` (número, padrão 30)
- Resposta 200:
  ```json
  {
    "periodo": "Últimos 30 dias",
    "resumo": [
      { "data": "2025-11-05", "votos": 12, "remocoes": 3, "invalidacoes": 1, "outros": 0 }
    ]
  }
  ```

### 7) DELETE /kardex/limpar-antigos (ADMIN)

- Objetivo: Remover registros antigos do Kardex (append-only com limpeza controlada).
- Query:
  - `dias` (número, padrão 365)
- Resposta:
  - 204 No Content

### 8) GET /kardex/exportar

- Objetivo: Exportar registros do Kardex em CSV com filtros (mesmos filtros de listar).
- Resposta 200: arquivo CSV.

Observações
- Todos endpoints do Kardex requerem JWT e roles adequados.
- Caso prefira uma rota alternativa sob `/admin/auditoria/votos`, posso criar um controller de alias que delega para o KardexService sem duplicação de lógica.

## Painel Admin (Frontend) – Auditoria de Votos

Disponibilidade: Painel Admin do frontend (módulo Votação > Auditoria). Acesso restrito a perfis ADMIN e FUNCIONARIO.

Objetivo: Permitir que administradores auditem ações de votação, identifiquem padrões suspeitos, acompanhem invalidações e exportem dados.

Requisitos de segurança
- Autenticação por JWT; o frontend deve enviar `Authorization: Bearer <token>` em todas as requisições.
- Autorização via roles: ADMIN ou FUNCIONARIO.
- Recomendado: rate limiting no backend e logs estruturados (nestjs-pino) para trilhas adicionais.

Funcionalidades principais no UI
- Tabela de Kardex com colunas:
  - Data/Hora (createdAt)
  - Ação (acao: VOTO_CRIADO, VOTO_REMOVIDO, VOTO_INVALIDADO, USUARIO_BLOQUEADO, CADASTRO_DESATIVADO)
  - Tipo de voto (tipo: COMUM, SUPER, quando aplicável)
  - Usuário (userId, link para perfil/visualização)
  - Cadastro (cadastroId, link para perfil do cão)
  - IP
  - UserAgent
  - Observações
  - Admin responsável (quando ação administrativa)
- Filtros avançados:
  - userId, cadastroId, acao, tipo, dataInicial, dataFinal, ip
- Paginação server-side:
  - page, limit (padrões: page=1, limit=10)
- Estatísticas/Resumo:
  - Cards e/ou gráficos com totais por ação (via `/kardex/estatisticas`)
  - Relatório focado em ações administrativas (via `/kardex/auditoria`)
- Exportação CSV:
  - Botão que chama `/kardex/exportar` com os mesmos filtros aplicados
- Detalhe do registro:
  - Modal/Drawer com payload completo do Kardex e links correlatos (voto ativo, usuário, cadastro)

Integração com a API (frontend)
- Listar registros para a tabela:
  - GET `/kardex/listar?page=1&limit=10&userId=...&cadastroId=...&acao=...&dataInicial=...&dataFinal=...`
- Estatísticas:
  - GET `/kardex/estatisticas`
- Relatório administrativo:
  - GET `/kardex/auditoria?dataInicio=...&dataFim=...&adminUserId=...`
- Exportar CSV:
  - GET `/kardex/exportar?page=1&limit=10&acao=...&userId=...` (resposta como arquivo CSV)

Boas práticas de UX
- Estados de carregamento (skeletons) e vazios (mensagem “Nenhum registro encontrado”).
- Tratamento de erro consistente (banner/toast com mensagem e ação de retry).
- Paginação com preservação de filtros (URL querystring sincronizada com estado do UI).
- Performance: paginação server-side, evitar N+1 requisições; usar debounce em filtros.

Exemplo (pseudo-código) de consumo no frontend
- Lista paginada:
  ```ts
  // Exemplo com fetch; ajuste para seu client HTTP
  const params = new URLSearchParams({ page: '1', limit: '10', acao: 'VOTO_INVALIDADO' });
  const res = await fetch(`/kardex/listar?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json(); // { kardex: [], total, page, limit, totalPages }
  ```
- Exportar CSV:
  ```ts
  const params = new URLSearchParams({ page: '1', limit: '100', acao: 'VOTO_CRIADO' });
  const res = await fetch(`/kardex/exportar?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const blob = await res.blob();
  downloadBlob(blob, 'auditoria-votos.csv');
  ```

Observação
- Caso o projeto opte por um alias mais claro no frontend, podemos expor um controller com prefixo `/admin/auditoria/votos` que delega para o KardexService, sem duplicar lógica.