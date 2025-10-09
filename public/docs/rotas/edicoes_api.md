# API de Edições da Revista

Este documento descreve os endpoints necessários para listar edições da revista e cadastrar uma nova edição com upload de PDF.

## Convenções

- Base URL: `{API_URL}` (ex.: `https://api.seudominio.com`)
- Autenticação: Bearer Token (JWT). Endpoints de escrita requerem perfil Admin.
- Respostas seguem o padrão:

```
{
  "statusCode": 200,
  "message": "ok",
  "data": { ... },
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

Você pode optar por devolver arrays diretamente (`Edicao[]`) nos endpoints de leitura para simplicidade.

## Modelo de Dados

```
Edicao {
  id: string;           // ex.: "2025-05" ou UUID
  titulo: string;       // ex.: "Edição Mai/Jun"
  bimestre: string;     // ex.: "Mai/Jun"
  ano: number;          // ex.: 2025
  pdfUrl?: string;      // URL pública do PDF
  capaUrl?: string;     // (opcional) URL da imagem da capa
  criadoEm?: string;    // ISO timestamp
}
```

## Endpoints

### GET /edicoes

Lista as edições. Suporta filtros simples.

- Query params (opcional):
  - `ano`: number
  - `page`: number (default 1)
  - `limit`: number (default 12)

Resposta (simplificada):

```
200 OK
[
  {
    "id": "2025-03",
    "titulo": "Edição Mar/Abr",
    "bimestre": "Mar/Abr",
    "ano": 2025,
    "pdfUrl": "https://cdn.seudominio.com/revista/2025-03.pdf"
  }
]
```

### GET /edicoes/:id

Obtém uma edição específica.

```
200 OK
{
  "id": "2025-03",
  "titulo": "Edição Mar/Abr",
  "bimestre": "Mar/Abr",
  "ano": 2025,
  "pdfUrl": "https://cdn.seudominio.com/revista/2025-03.pdf"
}
```

### GET /edicoes/ultima

Retorna a última edição (por data/ano mais recente).

```
200 OK
{
  "id": "2025-06",
  "titulo": "Edição Nov/Dez",
  "bimestre": "Nov/Dez",
  "ano": 2025,
  "pdfUrl": "https://cdn.seudominio.com/revista/2025-06.pdf"
}
```

### POST /edicoes

Cadastra uma nova edição e faz upload do PDF (e opcionalmente da imagem de capa).

- Autenticação: Admin (Bearer Token)
- Content-Type: `multipart/form-data`
- Campos do form:
  - `id` (opcional): string (se não for enviado, gere um UUID ou derive de ano+bimestre)
  - `titulo`: string (obrigatório)
  - `bimestre`: string (obrigatório, ex.: `Jan/Fev`, `Mar/Abr`, ...)
  - `ano`: number (obrigatório)
  - `pdf`: File (obrigatório, `application/pdf`)
  - `capa`: File (opcional, imagem `image/png` ou `image/jpeg`)

Resposta:

```
201 Created
{
  "statusCode": 201,
  "message": "Edição criada",
  "data": {
    "id": "2025-03",
    "titulo": "Edição Mar/Abr",
    "bimestre": "Mar/Abr",
    "ano": 2025,
    "pdfUrl": "https://cdn.seudominio.com/revista/2025-03.pdf",
    "capaUrl": "https://cdn.seudominio.com/revista/2025-03.jpg"
  },
  "timestamp": "2025-10-07T12:00:00.000Z"
}
```

#### Regras de Validação

- `pdf` deve ser PDF e até 50MB
- `titulo`, `bimestre`, `ano` obrigatórios
- `ano` entre 2000 e o ano atual
- `capa` (opcional) até 5MB, tipos `image/png` ou `image/jpeg`

#### Erros Comuns

```
400 Bad Request
{
  "statusCode": 400,
  "message": "Arquivo PDF inválido",
  "timestamp": "..."
}

401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
```

## Exemplo de Implementação (Node/NestJS)

Pseudo-código para o controller NestJS:

```ts
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Post('edicoes')
@UseInterceptors(FileFieldsInterceptor([
  { name: 'pdf', maxCount: 1 },
  { name: 'capa', maxCount: 1 },
]))
async criar(
  @UploadedFiles() files: { pdf?: Express.Multer.File[]; capa?: Express.Multer.File[] },
  @Body() dto: { id?: string; titulo: string; bimestre: string; ano: number }
) {
  const pdf = files.pdf?.[0];
  if (!pdf || pdf.mimetype !== 'application/pdf') {
    throw new BadRequestException('Arquivo PDF inválido');
  }
  const capa = files.capa?.[0];

  const pdfUrl = await storage.upload(pdf, `revista/${dto.ano}-${dto.bimestre}.pdf`);
  const capaUrl = capa ? await storage.upload(capa, `revista/${dto.ano}-${dto.bimestre}.jpg`) : undefined;

  const edicao = await edicoesService.create({
    id: dto.id ?? `${dto.ano}-${mapBimestre(dto.bimestre)}`,
    titulo: dto.titulo,
    bimestre: dto.bimestre,
    ano: dto.ano,
    pdfUrl,
    capaUrl,
  });
  return { statusCode: 201, message: 'Edição criada', data: edicao, timestamp: new Date().toISOString() };
}
```

Observações:
- `storage.upload` pode ser S3, GCP Storage, Azure Blob ou filesystem
- CORS deve permitir o domínio do site
- Proteja com `RolesGuard` para somente admin

## Boas Práticas

- Versão o arquivo com `{ano}-{bimestre}.pdf` para legibilidade
- Manter endpoint `GET /edicoes/ultima` para facilitar destaque no frontend
- CDN para servir PDFs com performance
- Logs e métricas para uploads