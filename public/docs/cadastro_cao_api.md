# Documentação da API de Cadastro de Cães (ExpoDog)

Esta documentação descreve os endpoints da API para o cadastro de cães no evento ExpoDog.

## Fluxo de Cadastro

### Cenário 1: Usuário cadastra um cão para si mesmo

1.  O usuário logado preenche os dados do cão.
2.  O front-end realiza os uploads de arquivos necessários (fotos, pedigree, etc.).
3.  O front-end envia a requisição para `POST /cadastro-cao` **sem** o campo `proprietarioId`. O back-end automaticamente associará o cão ao usuário autenticado.

### Cenário 2: Usuário cadastra um cão para um terceiro

1.  **Criar o Usuário do Terceiro:** Chame `POST /users/register-third-party` com os dados do novo proprietário para obter o `userId` dele.
2.  **Criar o Endereço do Terceiro (Opcional):** Se necessário, chame `POST /users/{userId}/enderecos` para adicionar um endereço para o novo usuário.
3.  **Cadastrar o Cão:** Chame `POST /cadastro-cao` e inclua o campo `proprietarioId` com o `userId` do terceiro no payload.

---

## Endpoints da API

### 1. Criar Usuário para Terceiro (Simplificado)

- **Endpoint:** `POST /users/register-third-party`
- **Descrição:** Cria uma conta de usuário para um terceiro com dados mínimos. Essencial para o fluxo de cadastro de cão para terceiros.
- **Autenticação:** Requer token JWT.
- **Corpo da Requisição:** `{ "nome": "...", "email": "...", "cpf": "...", "telefone": "..." }`
- **Resposta de Sucesso (201 Created):** `{ "userId": "cly123abcde" }`

### 2. Buscar Raças de Cães

- **Endpoint:** `GET /racas`
- **Descrição:** Retorna a lista de raças de cães disponíveis.
- **Autenticação:** Nenhuma.

### 3. Upload de Arquivos (Fotos, Pedigree, Vídeo)

- `POST /cadastro-cao/fotos-upload`
- `POST /cadastro-cao/pedigree-upload`
- `POST /cadastro-cao/video-upload`
- **Descrição:** Endpoints para upload de arquivos. Retornam as URLs que devem ser usadas no cadastro final.
- **Autenticação:** Requer token JWT.

### 4. Cadastro Final do Cão

- **Endpoint:** `POST /cadastro-cao`
- **Descrição:** Registra um novo cão, associando-o a um proprietário.
- **Autenticação:** Requer token JWT.

### 5. Listar Cadastros de Cães

- **Endpoint:** `GET /cadastros-cao`
- **Descrição:** Lista todos os cadastros de cães com filtros e paginação.
- **Autenticação:** Nenhuma.
- **Parâmetros de Query:** `page`, `limit`, `search`, `raca`, `sexo`, `cidade`, `estado`.
- **Resposta de Sucesso (200 OK):** Retorna um objeto com a lista de cadastros e informações de paginação.
- **Nota sobre Resposta Vazia:** Se nenhum cadastro for encontrado que corresponda aos filtros, o endpoint retornará uma resposta de sucesso (`200 OK`) com uma lista vazia (`"data": []`).

### 6. Listar Meus Cadastros

- **Endpoint:** `GET /cadastros-cao/meus-cadastros`
- **Descrição:** Lista todos os cães cadastrados pelo usuário autenticado.
- **Autenticação:** Requer token JWT.
- **Resposta de Sucesso (200 OK):** Retorna uma lista de objetos de cadastro de cão.
- **Nota sobre Resposta Vazia:** Se o usuário autenticado não possuir cães cadastrados, o endpoint retornará uma resposta de sucesso (`200 OK`) com uma lista vazia (`[]`).

---

## Modelo de Dados do Payload Final (`POST /cadastro-cao`)

#### Objeto `CadastroCaoPayload` (Raiz)
| Campo | Tipo | Descrição | Obrigatório |
| :--- | :--- | :--- | :--- |
| `proprietarioId` | String | `userId` do proprietário. **Se omitido**, o cão é associado ao usuário logado. | Não |
| `cao` | Objeto `Cao` | Contém todos os dados específicos do cão. | Sim |
| `videoOption` | String | Opção de vídeo. Valores: `upload`, `youtube`, `whatsapp`. | Sim |
| `confirmaWhatsapp` | Boolean | `true` se a opção de vídeo for `whatsapp`. | Se `videoOption` for `whatsapp` |
| `videoUrl` | String | URL do vídeo (do upload ou do YouTube). | Se `videoOption` for `upload` ou `youtube` |

#### Objeto `Cao`
| Campo | Tipo | Descrição | Obrigatório |
| :--- | :--- | :--- | :--- |
| `nome` | String | Nome de registro do cão. | Sim |
| `raca` | String | Raça do cão (valor de `GET /racas`). | Sim |
| `sexo` | String | Sexo do cão. Valores: `MACHO`, `FEMEA`. | Sim |
| `dataNascimento`| String | Data no formato `YYYY-MM-DD`. | Sim |
| `fotoPerfil` | String | **URL** da foto de perfil (de `/fotos-upload`). | Sim |
| `fotoLateral` | String | **URL** da foto lateral (de `/fotos-upload`). | Sim |
| `temPedigree` | Boolean | `true` se o cão possui pedigree. | Sim |
| `registroPedigree`| String | Número de registro do pedigree. | Se `temPedigree` for `true` |
| `pedigreeFrenteUrl`| String | **URL** da frente do pedigree (de `/pedigree-upload`). | Se `temPedigree` for `true` |
| `pedigreeVersoUrl`| String | **URL** do verso do pedigree (de `/pedigree-upload`). | Se `temPedigree` for `true` |
| `temMicrochip` | Boolean | `true` se o cão possui microchip. | Sim |
| `numeroMicrochip`| String | Número do microchip (15 dígitos). | Se `temMicrochip` for `true` |

---

### Exemplos de Payload Final

#### Exemplo 1: Usuário logado cadastra para si mesmo
```json
{
  "cao": {
    "nome": "Rex",
    "raca": "Golden Retriever",
    "sexo": "MACHO",
    "dataNascimento": "2022-05-10",
    "fotoPerfil": "https://example.com/uploads/images/perfil_rex.jpg",
    "fotoLateral": "https://example.com/uploads/images/lateral_rex.jpg",
    "temPedigree": false,
    "temMicrochip": true,
    "numeroMicrochip": "987654321098765"
  },
  "videoOption": "youtube",
  "videoUrl": "https://youtube.com/watch?v=video_id"
}
```

#### Exemplo 2: Usuário logado cadastra para um terceiro
```json
{
  "proprietarioId": "cly123abcde",
  "cao": {
    "nome": "Bella",
    "raca": "Labrador Retriever",
    "sexo": "FEMEA",
    "dataNascimento": "2021-03-15",
    "fotoPerfil": "https://example.com/uploads/images/perfil_bella.jpg",
    "fotoLateral": "https://example.com/uploads/images/lateral_bella.jpg",
    "temPedigree": false,
    "temMicrochip": false
  },
  "videoOption": "whatsapp",
  "confirmaWhatsapp": true
}
```

- **Resposta de Sucesso (201 Created):** `{ "message": "Cadastro realizado com sucesso!", "cadastroId": "..." }`
- **Resposta de Erro (400 Bad Request):** Se os dados forem inválidos.
