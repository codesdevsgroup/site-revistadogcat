# Documentação da API de Cadastro de Cães (ExpoDog)

Esta documentação descreve os endpoints da API para o cadastro de cães no evento ExpoDog.

## Modelo de Dados

### Cadastro de Cão

**Importante:** O sistema verifica se o proprietário é diferente do usuário logado. Se for o mesmo usuário, os dados do proprietário são preenchidos automaticamente a partir do perfil do usuário logado.

```json
{
  "proprietarioDiferente": false, // true se o proprietário for diferente do usuário logado
  "nomeProprietario": "João Silva", // Obrigatório apenas se proprietarioDiferente = true
  "cpfProprietario": "123.456.789-00", // Obrigatório apenas se proprietarioDiferente = true
  "emailProprietario": "joao@email.com", // Obrigatório apenas se proprietarioDiferente = true
  "telefoneProprietario": "(11) 99999-9999", // Opcional se proprietarioDiferente = true
  "enderecoProprietario": "Rua das Flores, 123", // Opcional se proprietarioDiferente = true
  "cidade": "São Paulo", // Opcional se proprietarioDiferente = true
  "estado": "SP", // Opcional se proprietarioDiferente = true
  "nome": "Rex", // Sempre obrigatório
  "raca": "Golden Retriever", // Sempre obrigatório
  "sexo": "Macho", // Sempre obrigatório
  "dataNascimento": "2022-05-10", // Sempre obrigatório
  "peso": "30kg", // Opcional
  "altura": "60cm", // Opcional
  "temPedigree": true, // Indica se o cão possui pedigree
  "registroPedigree": "ABC123XYZ", // Obrigatório se temPedigree = true
  "pedigreeFrente": "base64_encoded_image_or_file_path", // Obrigatório se temPedigree = true
  "pedigreeVerso": "base64_encoded_image_or_file_path", // Obrigatório se temPedigree = true
  "temMicrochip": true, // Indica se o cão possui microchip
  "numeroMicrochip": "987654321098765", // Obrigatório se temMicrochip = true
  "titulos": "Campeão de Agility", // Opcional
  "caracteristicas": "Pelagem dourada, muito dócil.", // Opcional
  "videoOption": "upload", // Sempre obrigatório
  "videoUrl": "https://example.com/uploads/videos/video_rex_123.mp4", // Obrigatório se videoOption = "upload" ou "url"
  "observacoes": "Vídeo de apresentação do Rex em treino." // Opcional
}
```

### Regras de Validação

1. **proprietarioDiferente = false:** Os dados do proprietário são automaticamente preenchidos com as informações do usuário logado. Campos de proprietário não devem ser enviados.

2. **proprietarioDiferente = true:** Os seguintes campos são obrigatórios:
   - `nomeProprietario`
   - `cpfProprietario` 
   - `emailProprietario`

3. **Dados do cão:** Sempre obrigatórios independente do proprietário:
   - `nome`
   - `raca`
   - `sexo`
   - `dataNascimento`
   - `videoOption`

4. **Pedigree (condicional):** Se `temPedigree = true`, os seguintes campos são obrigatórios:
   - `registroPedigree`
   - `pedigreeFrente` (arquivo de imagem ou PDF)
   - `pedigreeVerso` (arquivo de imagem ou PDF)

5. **Microchip (condicional):** Se `temMicrochip = true`, o seguinte campo é obrigatório:
   - `numeroMicrochip`

## Endpoints da API

### 1. Cadastro de Cão

- **Endpoint:** `POST /api/cadastro-cao`
- **Descrição:** Registra um novo cão no sistema ExpoDog.
- **Autenticação:** Requer token JWT válido no header `Authorization: Bearer <token>`
- **Corpo da Requisição:** JSON com os dados do cão e proprietário.

#### Exemplo 1: Proprietário é o mesmo usuário logado (com pedigree e microchip)
```json
{
  "proprietarioDiferente": false,
  "nome": "Rex",
  "raca": "Golden Retriever",
  "sexo": "Macho",
  "dataNascimento": "2022-05-10",
  "peso": "30kg",
  "altura": "60cm",
  "temPedigree": true,
  "registroPedigree": "ABC123XYZ",
  "pedigreeFrente": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "pedigreeVerso": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "temMicrochip": true,
  "numeroMicrochip": "987654321098765",
  "titulos": "Campeão de Agility",
  "caracteristicas": "Pelagem dourada, muito dócil.",
  "videoOption": "upload",
  "videoUrl": "https://example.com/uploads/videos/video_rex_123.mp4",
  "observacoes": "Vídeo de apresentação do Rex em treino."
}
```

#### Exemplo 2: Proprietário é diferente do usuário logado (sem pedigree, com microchip)
```json
{
  "proprietarioDiferente": true,
  "nomeProprietario": "Maria Santos",
  "cpfProprietario": "987.654.321-00",
  "emailProprietario": "maria@email.com",
  "telefoneProprietario": "(11) 88888-8888",
  "enderecoProprietario": "Av. Paulista, 456",
  "cidade": "São Paulo",
  "estado": "SP",
  "nome": "Bella",
  "raca": "Labrador",
  "sexo": "Fêmea",
  "dataNascimento": "2021-03-15",
  "peso": "25kg",
  "altura": "55cm",
  "temPedigree": false,
  "temMicrochip": true,
  "numeroMicrochip": "123456789012345",
  "videoOption": "url",
  "videoUrl": "https://youtube.com/watch?v=exemplo",
  "observacoes": "Cão muito ativo e sociável."
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
