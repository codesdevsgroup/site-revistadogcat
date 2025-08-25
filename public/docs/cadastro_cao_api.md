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
  "fotoPerfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", // Sempre obrigatório - Foto de perfil do animal
  "fotoLateral": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...", // Sempre obrigatório - Foto lateral do animal
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
  "videoOption": "upload", // Opcional - valores: "upload", "url", "whatsapp", "none"
  "videoUrl": "https://example.com/uploads/videos/video_rex_123.mp4", // Obrigatório se videoOption = "upload" ou "url"
  "whatsappContato": "(11) 99999-9999", // Obrigatório se videoOption = "whatsapp"
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
   - `fotoPerfil` (arquivo de imagem)
   - `fotoLateral` (arquivo de imagem)

4. **Vídeo (opcional):** Se `videoOption` for informado:
   - `videoOption = "upload"`: `videoUrl` é obrigatório
   - `videoOption = "url"`: `videoUrl` é obrigatório
   - `videoOption = "whatsapp"`: `whatsappContato` é obrigatório
   - `videoOption = "none"`: nenhum campo adicional necessário

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
  "fotoPerfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fotoLateral": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
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
  "fotoPerfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fotoLateral": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "peso": "25kg",
  "altura": "55cm",
  "temPedigree": false,
  "temMicrochip": true,
  "numeroMicrochip": "123456789012345",
  "videoOption": "whatsapp",
  "whatsappContato": "(11) 88888-8888",
  "observacoes": "Cão muito ativo e sociável."
}
```

#### Exemplo 3: Cadastro sem vídeo
```json
{
  "proprietarioDiferente": false,
  "nome": "Luna",
  "raca": "Border Collie",
  "sexo": "Fêmea",
  "dataNascimento": "2023-01-20",
  "fotoPerfil": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fotoLateral": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "peso": "18kg",
  "altura": "50cm",
  "temPedigree": false,
  "temMicrochip": false,
  "videoOption": "none",
  "caracteristicas": "Muito inteligente e ágil.",
  "observacoes": "Participará apenas das categorias básicas."
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

### 2. Upload de Imagens para Cadastro de Cão

- **Endpoint:** `POST /api/cadastro-cao/image-upload`
- **Descrição:** Recebe arquivos de imagem (foto de perfil e lateral), processa-os e retorna as URLs públicas. Este endpoint deve ser chamado antes do endpoint de Cadastro de Cão.
- **Corpo da Requisição:** `multipart/form-data` com os campos:
  - `fotoPerfil`: arquivo de imagem do perfil do animal
  - `fotoLateral`: arquivo de imagem lateral do animal
- **Tipos de Arquivo Suportados:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
- **Tamanho Máximo:** 5MB por imagem.
- **Processamento:** As imagens são redimensionadas e otimizadas automaticamente:
  - Foto de perfil: 400x400px (quadrada)
  - Foto lateral: 600x400px (retangular)
- **Imagens de Referência:** O sistema disponibiliza imagens modelo em `/public/dog/` para orientar o usuário:
  - `perfil.jpg`: Exemplo de foto de perfil adequada
  - `lateral.jpg`: Exemplo de foto lateral adequada
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "fotoPerfil": "https://example.com/uploads/images/perfil_cao_12345.jpg",
    "fotoLateral": "https://example.com/uploads/images/lateral_cao_12345.jpg"
  }
  ```
- **Resposta de Erro (400 Bad Request):** Se nenhum arquivo for enviado, o tipo de arquivo não for suportado ou o tamanho exceder o limite.

### 3. Upload de Vídeo para Cadastro de Cão

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

## Fluxo de Cadastro

O processo de cadastro de cães no ExpoDog segue os seguintes passos:

### Passo 1: Dados do Proprietário
- Verificação se o proprietário é o mesmo usuário logado
- Preenchimento dos dados do proprietário (se diferente do usuário logado)

### Passo 2: Upload de Imagens do Animal
- **Upload obrigatório** da foto de perfil do animal
- **Upload obrigatório** da foto lateral do animal
- Exibição das imagens de referência (`/public/dog/perfil.jpg` e `/public/dog/lateral.jpg`) para orientar o usuário
- Processamento automático e redimensionamento das imagens

### Passo 3: Dados Básicos do Animal
- Nome, raça, sexo, data de nascimento
- Peso e altura (opcionais)
- Características e títulos (opcionais)

### Passo 4: Documentação e Vídeo (antigo Passo 3)
- Upload de documentos de pedigree (se aplicável)
- Informações de microchip (se aplicável)
- **Vídeo de apresentação (opcional):**
  - Upload direto de arquivo
  - URL de vídeo (YouTube, Vimeo, etc.)
  - Envio posterior via WhatsApp
  - Pular vídeo (não obrigatório)
- Observações adicionais

### Finalização
- Validação de todos os dados obrigatórios
- Envio do cadastro completo via `POST /api/cadastro-cao`

## Validações de Imagem

### Requisitos Técnicos
- **Formatos aceitos:** JPEG, JPG, PNG, WebP
- **Tamanho máximo:** 5MB por imagem
- **Resolução mínima:** 300x300px para perfil, 400x300px para lateral
- **Qualidade:** Imagens nítidas e bem iluminadas

### Orientações para o Usuário
- **Foto de Perfil:** Deve mostrar claramente a cabeça e peito do animal, similar à imagem de referência
- **Foto Lateral:** Deve mostrar o animal de perfil completo, em posição de exposição, similar à imagem de referência
- As imagens de referência em `/public/dog/` servem como guia visual durante o upload

## Opções de Vídeo

O vídeo de apresentação é **opcional** no cadastro do ExpoDog. O usuário pode escolher entre as seguintes opções:

### 1. Upload Direto (`videoOption: "upload"`)
- Upload de arquivo de vídeo diretamente no sistema
- Formatos aceitos: MP4, MOV, AVI, QuickTime
- Tamanho máximo: 50MB
- Processamento automático após upload

### 2. URL de Vídeo (`videoOption: "url"`)
- Link para vídeo hospedado em plataformas como YouTube, Vimeo, etc.
- Validação automática da URL fornecida
- Vídeo deve estar público ou não listado

### 3. Envio via WhatsApp (`videoOption: "whatsapp"`)
- Usuário fornece número de WhatsApp para contato
- Vídeo será enviado posteriormente via WhatsApp
- Equipe do ExpoDog entrará em contato para receber o vídeo
- Formato recomendado: `whatsappContato: "(11) 99999-9999"`

### 4. Sem Vídeo (`videoOption: "none"`)
- Cadastro realizado sem vídeo de apresentação
- Opção válida para participantes que não desejam ou não podem fornecer vídeo
- Não afeta a participação no evento

### Observações Importantes
- O vídeo é **opcional** e não impede a participação no ExpoDog
- Vídeos ajudam na avaliação e apresentação do animal
- Para envio via WhatsApp, a equipe entrará em contato em até 48 horas
- Vídeos devem mostrar o animal em movimento e diferentes ângulos
