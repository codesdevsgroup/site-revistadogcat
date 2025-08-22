# Documentação da API de Cadastro de Cães (ExpoDog)

Esta documentação descreve os endpoints da API para o cadastro de cães no evento ExpoDog.

## Modelo de Dados: Cadastro de Cão

O objeto de requisição para o cadastro de um cão combina informações do proprietário, do cão e detalhes sobre o vídeo de apresentação.

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `nomeCompleto` | `string` | Nome completo do proprietário. | Sim |
| `cpf` | `string` | CPF do proprietário. | Sim |
| `email` | `string` | E-mail do proprietário. | Sim |
| `telefone` | `string` | Telefone de contato do proprietário. | Sim |
| `endereco` | `string` | Endereço do proprietário. | Não |
| `cep` | `string` | CEP do proprietário. | Não |
| `cidade` | `string` | Cidade do proprietário. | Não |
| `estado` | `string` | Estado do proprietário. | Não |
| `nome` | `string` | Nome do cão. | Sim |
| `raca` | `string` | Raça do cão. | Sim |
| `sexo` | `string` | Sexo do cão (`Macho` ou `Fêmea`). | Sim |
| `dataNascimento` | `string` | Data de nascimento do cão (formato `YYYY-MM-DD`). | Sim |
| `peso` | `string` | Peso do cão. | Não |
| `altura` | `string` | Altura do cão. | Não |
| `registroPedigree` | `string` | Número de registro do pedigree. | Sim |
| `microchip` | `string` | Número do microchip do cão. | Não |
| `nomePai` | `string` | Nome do pai do cão. | Não |
| `nomeMae` | `string` | Nome da mãe do cão. | Não |
| `titulos` | `string` | Títulos conquistados pelo cão. | Não |
| `caracteristicas` | `string` | Características distintivas do cão. | Não |
| `videoOption` | `string` | Opção de envio de vídeo (`upload`, `youtube`, `whatsapp`). | Sim |
| `videoUrl` | `string` | URL do vídeo (se `videoOption` for `upload` ou `youtube`). | Condicional |
| `confirmaWhatsapp` | `boolean` | Confirmação de envio de vídeo via WhatsApp (se `videoOption` for `whatsapp`). | Condicional |
| `observacoes` | `string` | Observações adicionais sobre o vídeo. | Não |

## Endpoints da API

### 1. Cadastro de Cão

- **Endpoint:** `POST /api/cadastro-cao`
- **Descrição:** Registra um novo cão para o evento ExpoDog, incluindo dados do proprietário e detalhes do vídeo.
- **Corpo da Requisição:**
  ```json
  {
    "nomeCompleto": "Ana Paula Silva",
    "cpf": "123.456.789-00",
    "email": "ana.silva@example.com",
    "telefone": "(11) 98765-4321",
    "cep": "01001-000",
    "endereco": "Praça da Sé",
    "cidade": "São Paulo",
    "estado": "SP",
    "nome": "Rex",
    "raca": "Golden Retriever",
    "sexo": "Macho",
    "dataNascimento": "2022-05-10",
    "peso": "30kg",
    "altura": "60cm",
    "registroPedigree": "ABC123XYZ",
    "microchip": "987654321098765",
    "titulos": "Campeão de Agility",
    "caracteristicas": "Pelagem dourada, muito dócil.",
    "videoOption": "upload",
    "videoUrl": "https://example.com/uploads/videos/video_rex_123.mp4",
    "observacoes": "Vídeo de apresentação do Rex em treino."
  }
  ```
- **Resposta de Sucesso (201 Created - E você jurando que não ia dar certo.):**
  ```json
  {
    "message": "Cadastro realizado com sucesso!",
    "cadastroId": "cuid-do-cadastro"
  }
  ```
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se os dados fornecidos forem inválidos ou incompletos.

### 2. Upload de Vídeo para Cadastro de Cão

- **Endpoint:** `POST /api/cadastro-cao/video-upload`
- **Descrição:** Recebe um arquivo de vídeo, salva-o e retorna a URL pública. Este endpoint deve ser chamado antes do endpoint de Cadastro de Cão se a `videoOption` for `upload`.
- **Corpo da Requisição:** `multipart/form-data` com um campo `video` contendo o arquivo de vídeo.
- **Tipos de Arquivo Suportados:** `video/mp4`, `video/mov`, `video/avi`, `video/quicktime`.
- **Tamanho Máximo:** 50MB.
- **Resposta de Sucesso (200 OK - O raro momento em que tudo funciona.):**
  ```json
  {
    "url": "https://example.com/uploads/videos/nome_do_video_12345.mp4"
  }
  ```
- **Resposta de Erro (400 Bad Request - A culpa é do usuário. Sempre.):** Se nenhum arquivo for enviado, o tipo de arquivo não for suportado ou o tamanho exceder o limite.
