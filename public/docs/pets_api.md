# Documentação da API de Pets

Esta documentação descreve os endpoints da API para gerenciamento de pets no sistema.

## Modelo de Dados: Pet

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `petId` | `string` | Identificador único do pet (CUID). | Não (gerado pelo servidor) |
| `nome` | `string` | Nome do pet. | Sim |
| `raca` | `string` | Raça do pet. | Sim |
| `sexo` | `string` | Sexo do pet (Macho/Fêmea). | Sim |
| `dataNascimento` | `string` | Data de nascimento do pet (ISO 8601). | Sim |
| `peso` | `string` | Peso do pet (ex: "30kg"). | Não |
| `altura` | `string` | Altura do pet (ex: "60cm"). | Não |
| `cor` | `string` | Cor predominante do pet. | Não |
| `temPedigree` | `boolean` | Indica se o pet possui pedigree. | Não (padrão: false) |
| `registroPedigree` | `string` | Número de registro do pedigree. | Condicional* |
| `pedigreeFrente` | `string` | URL da imagem da frente do pedigree. | Condicional* |
| `pedigreeVerso` | `string` | URL da imagem do verso do pedigree. | Condicional* |
| `temMicrochip` | `boolean` | Indica se o pet possui microchip. | Não (padrão: false) |
| `numeroMicrochip` | `string` | Número do microchip. | Condicional** |
| `titulos` | `string` | Títulos e premiações do pet. | Não |
| `observacoes` | `string` | Observações adicionais sobre o pet. | Não |
| `ativo` | `boolean` | Indica se o pet está ativo no sistema. | Não (padrão: true) |
| `createdAt` | `string` | Data de criação do registro. | Não (gerado pelo servidor) |
| `updatedAt` | `string` | Data da última atualização. | Não (gerado pelo servidor) |

**Condicionais:**
- *Obrigatório se `temPedigree = true`
- **Obrigatório se `temMicrochip = true`

## Modelo de Relacionamento: Pet-Proprietário

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `petProprietarioId` | `string` | Identificador único da relação. | Não (gerado pelo servidor) |
| `petId` | `string` | ID do pet. | Sim |
| `proprietarioId` | `string` | ID do usuário proprietário. | Sim |
| `cadastradoPorId` | `string` | ID do usuário que fez o cadastro. | Sim |
| `tipoPropriedade` | `string` | Tipo de propriedade (PROPRIO/TERCEIRO). | Sim |
| `dataInicio` | `string` | Data de início da propriedade. | Sim |
| `dataFim` | `string` | Data de fim da propriedade (se aplicável). | Não |
| `ativo` | `boolean` | Indica se a relação está ativa. | Não (padrão: true) |
| `createdAt` | `string` | Data de criação da relação. | Não (gerado pelo servidor) |

## Tipos de Propriedade

| Tipo | Descrição | Cenário de Uso |
| --- | --- | --- |
| `PROPRIO` | O usuário logado é o proprietário do pet | Usuário cadastra seu próprio pet |
| `TERCEIRO` | O usuário logado cadastra para outra pessoa | Usuário cadastra pet de terceiro |

## Endpoints da API

### 1. Cadastrar Pet

- **Endpoint:** `POST /api/pets`
- **Descrição:** Cadastra um novo pet no sistema.
- **Autenticação:** Requer token JWT válido.
- **Corpo da Requisição:**

```json
{
  "pet": {
    "nome": "Rex",
    "raca": "Golden Retriever",
    "sexo": "Macho",
    "dataNascimento": "2022-05-10",
    "peso": "30kg",
    "altura": "60cm",
    "cor": "Dourado",
    "temPedigree": true,
    "registroPedigree": "ABC123XYZ",
    "temMicrochip": true,
    "numeroMicrochip": "987654321098765",
    "titulos": "Campeão de Agility",
    "observacoes": "Pet muito dócil e obediente"
  },
  "proprietario": {
    "tipoPropriedade": "PROPRIO",
    "proprietarioId": null,
    "dadosProprietario": null
  }
}
```

**Para cadastro de terceiro:**
```json
{
  "pet": {
    // dados do pet...
  },
  "proprietario": {
    "tipoPropriedade": "TERCEIRO",
    "proprietarioId": "user_id_existente", // se o proprietário já tem conta
    "dadosProprietario": { // se o proprietário não tem conta
      "nome": "João Silva",
      "email": "joao@email.com",
      "cpf": "123.456.789-00",
      "telefone": "(11) 99999-9999",
      "endereco": "Rua das Flores, 123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    }
  }
}
```

- **Resposta de Sucesso (201 Created):**
```json
{
  "success": true,
  "message": "Pet cadastrado com sucesso",
  "data": {
    "petId": "pet_12345",
    "nome": "Rex",
    "proprietarioId": "user_67890",
    "cadastradoPorId": "user_11111"
  }
}
```

### 2. Listar Pets do Usuário

- **Endpoint:** `GET /api/pets/meus-pets`
- **Descrição:** Lista todos os pets do usuário logado (como proprietário).
- **Autenticação:** Requer token JWT válido.
- **Parâmetros de Query:**
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Itens por página (padrão: 10)
  - `ativo` (opcional): Filtrar por status ativo (true/false)

- **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "pets": [
      {
        "petId": "pet_12345",
        "nome": "Rex",
        "raca": "Golden Retriever",
        "sexo": "Macho",
        "dataNascimento": "2022-05-10",
        "idade": "2 anos",
        "cadastradoPor": {
          "userId": "user_11111",
          "nome": "Maria Silva"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### 3. Listar Pets Cadastrados pelo Usuário

- **Endpoint:** `GET /api/pets/cadastrados-por-mim`
- **Descrição:** Lista todos os pets cadastrados pelo usuário logado (incluindo para terceiros).
- **Autenticação:** Requer token JWT válido.
- **Parâmetros de Query:** Mesmos da listagem anterior.

### 4. Obter Detalhes do Pet

- **Endpoint:** `GET /api/pets/{petId}`
- **Descrição:** Obtém detalhes completos de um pet específico.
- **Autenticação:** Requer token JWT válido.
- **Permissões:** Proprietário, quem cadastrou, ou ADMIN.

- **Resposta de Sucesso (200 OK):**
```json
{
  "success": true,
  "data": {
    "petId": "pet_12345",
    "nome": "Rex",
    "raca": "Golden Retriever",
    "sexo": "Macho",
    "dataNascimento": "2022-05-10",
    "peso": "30kg",
    "altura": "60cm",
    "cor": "Dourado",
    "temPedigree": true,
    "registroPedigree": "ABC123XYZ",
    "pedigreeFrente": "https://example.com/pedigree-frente.jpg",
    "pedigreeVerso": "https://example.com/pedigree-verso.jpg",
    "temMicrochip": true,
    "numeroMicrochip": "987654321098765",
    "titulos": "Campeão de Agility",
    "observacoes": "Pet muito dócil e obediente",
    "proprietario": {
      "userId": "user_67890",
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999"
    },
    "cadastradoPor": {
      "userId": "user_11111",
      "nome": "Maria Silva"
    },
    "tipoPropriedade": "PROPRIO",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 5. Atualizar Pet

- **Endpoint:** `PUT /api/pets/{petId}`
- **Descrição:** Atualiza dados de um pet.
- **Autenticação:** Requer token JWT válido.
- **Permissões:** Proprietário, quem cadastrou, ou ADMIN.
- **Corpo da Requisição:** Mesma estrutura do cadastro (apenas campos a serem atualizados).

### 6. Desativar Pet

- **Endpoint:** `PATCH /api/pets/{petId}/desativar`
- **Descrição:** Desativa um pet (soft delete).
- **Autenticação:** Requer token JWT válido.
- **Permissões:** Proprietário, quem cadastrou, ou ADMIN.

### 7. Transferir Propriedade

- **Endpoint:** `POST /api/pets/{petId}/transferir`
- **Descrição:** Transfere a propriedade de um pet para outro usuário.
- **Autenticação:** Requer token JWT válido.
- **Permissões:** Proprietário atual ou ADMIN.
- **Corpo da Requisição:**
```json
{
  "novoProprietarioId": "user_99999",
  "dataTransferencia": "2024-02-01",
  "observacoes": "Transferência por venda"
}
```

### 8. Upload de Documentos do Pet

- **Endpoint:** `POST /api/pets/{petId}/documentos`
- **Descrição:** Faz upload de documentos do pet (pedigree, certificados, etc.).
- **Autenticação:** Requer token JWT válido.
- **Permissões:** Proprietário, quem cadastrou, ou ADMIN.
- **Corpo da Requisição:** `multipart/form-data`
- **Campos aceitos:** `pedigreeFrente`, `pedigreeVerso`, `certificados`

### 9. Buscar Pets (Admin)

- **Endpoint:** `GET /api/pets/buscar`
- **Descrição:** Busca pets no sistema com filtros avançados.
- **Autenticação:** Requer token JWT válido.
- **Permissões:** ADMIN, EDITOR, FUNCIONARIO.
- **Parâmetros de Query:**
  - `nome` (opcional): Nome do pet
  - `raca` (opcional): Raça do pet
  - `proprietario` (opcional): Nome do proprietário
  - `temPedigree` (opcional): true/false
  - `temMicrochip` (opcional): true/false
  - `ativo` (opcional): true/false
  - `page` (opcional): Número da página
  - `limit` (opcional): Itens por página

## Regras de Negócio

### Propriedade de Pets

1. **Pet Próprio:** Quando `tipoPropriedade = "PROPRIO"`
   - O usuário logado é automaticamente definido como proprietário
   - Dados do proprietário são preenchidos do perfil do usuário

2. **Pet de Terceiro:** Quando `tipoPropriedade = "TERCEIRO"`
   - Deve informar `proprietarioId` (se o proprietário já tem conta) OU
   - Deve informar `dadosProprietario` (para criar nova conta)
   - O usuário logado fica como "cadastrado por"

3. **Múltiplos Pets:** Um usuário pode ter quantos pets quiser

4. **Histórico de Propriedade:** Mantém histórico de transferências

### Validações

- Nome do pet deve ter entre 2 e 50 caracteres
- Data de nascimento não pode ser futura
- Se `temPedigree = true`, campos de pedigree são obrigatórios
- Se `temMicrochip = true`, número do microchip é obrigatório
- Número do microchip deve ser único no sistema
- Registro de pedigree deve ser único no sistema
- Sexo deve ser "Macho" ou "Fêmea"

### Permissões

- **Proprietário:** Pode visualizar, editar e desativar seus pets
- **Cadastrador:** Pode visualizar e editar pets que cadastrou
- **ADMIN/EDITOR/FUNCIONARIO:** Acesso total a todos os pets
- **Outros usuários:** Sem acesso (exceto pets públicos em exposições)

### Segurança

- Todos os endpoints requerem autenticação
- Logs de auditoria para todas as operações
- Rate limiting em endpoints de upload
- Validação de tipos de arquivo para documentos
- Proteção contra acesso não autorizado

## Integração com ExpoDoG

Os pets cadastrados através desta API podem ser automaticamente disponibilizados para participação na ExpoDoG, seguindo as regras específicas do evento:

- Pets com pedigree têm prioridade
- Validação adicional de documentos para participação
- Categorização automática por raça e idade
- Integração com sistema de avaliação de juízes

## Códigos de Erro

Ver documentação específica em `error_codes.md` para códigos de erro detalhados relacionados à API de Pets.

## Notas de Implementação

### Performance
- Índices em campos de busca frequente (nome, raça, proprietarioId)
- Cache de dados de pets populares
- Paginação obrigatória em listagens
- Otimização de queries com joins

### Backup e Recuperação
- Backup automático de documentos uploadados
- Versionamento de alterações importantes
- Soft delete para manter histórico
- Logs detalhados para auditoria