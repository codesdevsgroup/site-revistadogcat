# Documentação da API de Usuários e Autenticação

Esta documentação descreve os endpoints da API para gerenciamento e autenticação de usuários.

## Modelo de Dados: Usuário

| Campo | Tipo | Descrição | Obrigatório no Cadastro |
| --- | --- | --- | --- |
| `userId` | `string` | Identificador único do usuário (CUID). | Não (gerado pelo servidor) |
| `userName` | `string` | Nome de usuário único para exibição pública. | Sim |
| `name` | `string` | Nome completo do usuário. | Sim |
| `email` | `string` | Endereço de e-mail único do usuário. | Sim |
| `password` | `string` | Senha do usuário (somente para escrita). | Sim |
| `cpf` | `string` | CPF do usuário. | Não |
| `telefone` | `string` | Telefone de contato do usuário. | Não |
| `avatarUrl` | `string` | URL da imagem de perfil do usuário. | Não |
| `role` | `string` | Papel do usuário no sistema. | Não (padrão: `USUARIO_COMUM`) |
| `active` | `boolean`| Indica se a conta do usuário está ativa. | Não (padrão: `false`) |
| `createdAt` | `string` | Data de criação da conta. | Não (gerado pelo servidor) |

**Nota:** Os endereços do usuário são gerenciados separadamente através da API de Endereços. Consulte a documentação `enderecos_api.md` para mais detalhes.

## Níveis de Acesso (Roles)

O campo `role` define as permissões de um usuário no sistema. O sistema possui 5 tipos de usuários específicos para o modelo de negócio da revista de pets:

| Role | Descrição | Permissões |
| --- | --- | --- |
| `USUARIO` | Usuário básico da plataforma (padrão). | Acesso a conteúdo público, gerenciar próprio perfil. |
| `DONO_PET_APROVADO` | Dono de pet verificado na plataforma. | Funcionalidades básicas + perfil verificado como dono de pet. |
| `ASSINANTE` | Usuário com assinatura ativa da revista. | Conteúdo exclusivo para assinantes + funcionalidades premium. |
| `DONO_PET_APROVADO_ASSINANTE` | Dono de pet aprovado com assinatura premium. | Todos os benefícios de assinante + perfil premium verificado. |
| `ADMIN` | Administrador do sistema. | Acesso total: gerenciar usuários, conteúdo e configurações. |
| `EDITOR` | Editor da revista. | Acesso para editar conteúdo da revista.
| `FUNCIONARIO` | Funcionário da revista. | Acesso para gerenciar conteúdo e usuários. |

## Endpoints de Autenticação

### 1. Cadastro de Novo Usuário

- **Endpoint:** `POST /api/auth/register`
- **Resposta de Sucesso (201 Created - E você jurando que não ia dar certo.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

### 2. Ativação da Conta

- **Endpoint:** `POST /api/auth/activate`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

### 3. Login de Usuário

- **Endpoint:** `POST /api/auth/login`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (401 Unauthorized - Você não tem permissão, jovem gafanhoto.)**

### 4. Solicitar Redefinição de Senha

- **Endpoint:** `POST /api/auth/forgot-password`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**

### 5. Redefinir Senha

- **Endpoint:** `POST /api/auth/reset-password`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**

## Funcionalidades Específicas da Revista de Pets

### Hierarquia de Acesso

O sistema implementa uma hierarquia específica para o modelo de negócio da revista:

```
ADMIN
├── Gerenciar todos os usuários
├── Bloquear/desbloquear contas
├── Alterar roles de usuários
└── Acesso a logs do sistema

DONO_PET_APROVADO_ASSINANTE
├── Conteúdo premium exclusivo
├── Funcionalidades avançadas
└── Perfil verificado premium

ASSINANTE
├── Conteúdo exclusivo para assinantes
└── Funcionalidades premium

DONO_PET_CADASTRADO
├── Perfil verificado como dono de pet
└── Funcionalidades básicas

USUARIO_COMUM
├── Conteúdo público
└── Funcionalidades básicas
```

### Segurança e Auditoria

- **Rate Limiting:** Proteção contra ataques de força bruta
- **Logs de Auditoria:** Todas as ações são registradas
- **Notificações de Segurança:** Alertas automáticos por e-mail
- **Bloqueio Automático:** Após múltiplas tentativas de login falhadas

## Endpoints de Gerenciamento de Usuário

(Requerem autenticação)

### 1. Obter Dados do Usuário

- **Endpoint:** `GET /api/users/{id}`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.)**

### 2. Listar Todos os Usuários (Apenas Admin)

- **Endpoint:** `GET /api/users`
- **Descrição:** Lista todos os usuários do sistema com paginação.
- **Permissão Requerida:** `ADMIN`
- **Parâmetros de Query:**
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Itens por página (padrão: 10)
  - `search` (opcional): Busca por nome ou email
  - `role` (opcional): Filtrar por role específica
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se o requisitante não for ADMIN.

### 3. Atualizar Dados do Usuário

- **Endpoint:** `PUT /api/users/{id}`
- **Descrição:** Atualiza os dados de um usuário. O usuário só pode atualizar seus próprios dados (a menos que seja ADMIN).
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se tentar editar outro usuário sem ser ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.)**

### 4. Bloquear Usuário (Apenas Admin)

- **Endpoint:** `PATCH /api/users/{id}/block`
- **Descrição:** Bloqueia a conta de um usuário, impedindo o login.
- **Permissão Requerida:** `ADMIN`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se o requisitante não for ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o usuário não for encontrado.

### 5. Desbloquear Usuário (Apenas Admin)

- **Endpoint:** `PATCH /api/users/{id}/unblock`
- **Descrição:** Desbloqueia a conta de um usuário, permitindo o login novamente.
- **Permissão Requerida:** `ADMIN`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se o requisitante não for ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o usuário não for encontrado.

### 6. Atualizar Role do Usuário (Apenas Admin)

- **Endpoint:** `PATCH /api/users/{id}/role`
- **Descrição:** Atualiza o nível de acesso (role) de um usuário.
- **Permissão Requerida:** `ADMIN`
- **Corpo da Requisição:**
  ```json
  {
    "role": "ASSINANTE"
  }
  ```
- **Roles Válidas:** `USUARIO_COMUM`, `DONO_PET_CADASTRADO`, `ASSINANTE`, `DONO_PET_APROVADO_ASSINANTE`, `ADMIN`
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.)**
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se a role fornecida for inválida.
- **Resposta de Erro (403 Forbidden - Mesmo com permissão, não entra.):** Se o requisitante não for ADMIN.
- **Resposta de Erro (404 Not Found - O clássico: só existe em produção.):** Se o usuário não for encontrado.

## Endpoint de Upload de Avatar

### 1. Upload de Avatar

- **Endpoint:** `POST /api/users/avatar-upload`
- **Descrição:** O back-end deve associar a URL ao usuário autenticado.
- **Corpo da Requisição:** `multipart/form-data` com um campo `avatar` contendo o arquivo.
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  {
    "avatarUrl": "https://example.com/uploads/avatars/nome_do_avatar_12345.jpg"
  }
  ```
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.)**
- **Resposta de Erro (401 Unauthorized - Você não tem permissão, jovem gafanhoto.)**

## Exemplos de Uso

### Fluxo de Cadastro de Dono de Pet

1. **Registro inicial:** `POST /api/auth/register` (role: `USUARIO_COMUM`)
2. **Ativação da conta:** `POST /api/auth/activate`
3. **Upgrade para dono de pet:** Admin altera role para `DONO_PET_CADASTRADO`
4. **Assinatura:** Admin altera role para `DONO_PET_APROVADO_ASSINANTE`

### Fluxo de Assinatura

1. **Usuário comum:** `USUARIO` acessa conteúdo público
2. **Assinatura:** Admin altera role para `ASSINANTE`
3. **Acesso premium:** Usuário agora acessa conteúdo exclusivo

### Casos de Uso por Role

#### USUARIO_COMUM
- Visualizar artigos públicos
- Gerenciar próprio perfil
- Fazer upload de avatar

#### DONO_PET_CADASTRADO
- Todas as funcionalidades de `USUARIO`
- Perfil verificado como dono de pet
- Acesso a funcionalidades específicas para donos de pet

#### ASSINANTE
- Todas as funcionalidades básicas
- Acesso a conteúdo premium exclusivo
- Funcionalidades avançadas da revista

#### DONO_PET_APROVADO_ASSINANTE
- Todas as funcionalidades de `ASSINANTE`
- Perfil premium verificado
- Acesso a conteúdo exclusivo para donos de pet assinantes

#### ADMIN
- Gerenciar todos os usuários
- Alterar roles
- Bloquear/desbloquear contas
- Acesso a logs e auditoria

## Notas de Implementação

### Segurança
- Todos os endpoints protegidos requerem token JWT válido
- Rate limiting aplicado em endpoints de autenticação
- Logs de auditoria para todas as ações administrativas
- Notificações automáticas para atividades suspeitas

### Validações
- Email deve ser único no sistema
- Username deve ser único no sistema
- CPF deve seguir formato válido (quando fornecido)
- Senha deve ter no mínimo 8 caracteres
- Avatar deve ser imagem válida (JPG, PNG, WebP)

### Performance
- Paginação implementada em listagens
- Cache de dados de usuário frequentemente acessados
- Otimização de queries para roles e permissões
