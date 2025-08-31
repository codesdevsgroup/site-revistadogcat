# Documentação da API de Endereços

Esta documentação descreve os endpoints da API para gerenciamento de endereços dos usuários.

## Modelo de Dados: Endereço

| Campo | Tipo | Descrição | Obrigatório |
| --- | --- | --- | --- |
| `enderecoId` | `string` | Identificador único do endereço (CUID). | Não (gerado pelo servidor) |
| `userId` | `string` | ID do usuário proprietário do endereço. | Sim |
| `tipo` | `string` | Tipo do endereço. | Sim |
| `nome` | `string` | Nome/apelido do endereço (ex: "Casa", "Trabalho"). | Não |
| `logradouro` | `string` | Rua, avenida, etc. | Sim |
| `numero` | `string` | Número do endereço. | Sim |
| `complemento` | `string` | Complemento (apartamento, bloco, etc.). | Não |
| `bairro` | `string` | Bairro. | Sim |
| `cidade` | `string` | Cidade. | Sim |
| `estado` | `string` | Estado (UF). | Sim |
| `cep` | `string` | CEP no formato 00000-000. | Sim |
| `pontoReferencia` | `string` | Ponto de referência próximo. | Não |
| `principal` | `boolean` | Indica se é o endereço principal do usuário. | Não (padrão: `false`) |
| `ativo` | `boolean` | Indica se o endereço está ativo. | Não (padrão: `true`) |
| `createdAt` | `string` | Data de criação do endereço. | Não (gerado pelo servidor) |
| `updatedAt` | `string` | Data da última atualização. | Não (gerado pelo servidor) |

## Integração com BuscaCEP (Frontend)

### Funcionalidade de Preenchimento Automático

O frontend implementa integração com a API BuscaCEP para facilitar o preenchimento de endereços:

#### Como Funciona
1. **Entrada do CEP:** Usuário digita o CEP no campo correspondente
2. **Validação:** Sistema valida o formato (00000-000)
3. **Busca Automática:** Consulta a API BuscaCEP quando o CEP está completo
4. **Preenchimento:** Campos são preenchidos automaticamente com os dados retornados

#### Campos Preenchidos Automaticamente
- **Logradouro:** Rua, avenida, etc.
- **Bairro:** Nome do bairro
- **Cidade:** Nome da cidade
- **Estado:** UF do estado

#### Estados Visuais do Campo CEP
- **Normal:** Campo padrão para digitação
- **Carregando:** Indicador visual durante a busca (classe `cep-loading`)
- **Sucesso:** CEP encontrado e dados preenchidos (classe `cep-success`)
- **Erro:** CEP não encontrado ou inválido (classe `cep-error`)

#### Tratamento de Erros
- **CEP Inválido:** Mensagem de erro e campo destacado em vermelho
- **CEP Não Encontrado:** Permite preenchimento manual dos campos
- **Erro de Conexão:** Fallback para preenchimento manual

#### Experiência do Usuário
- Campos são preenchidos em tempo real
- Usuário pode editar campos preenchidos automaticamente
- Validação visual imediata do CEP
- Feedback claro sobre o status da busca

### Implementação Técnica (Frontend)

```typescript
// Exemplo de uso no componente Angular
export class EnderecoFormComponent {
  cepStatus: 'normal' | 'loading' | 'success' | 'error' = 'normal';
  
  async buscarCep(cep: string) {
    if (this.validarFormatoCep(cep)) {
      this.cepStatus = 'loading';
      
      try {
        const endereco = await this.buscaCepService.buscar(cep);
        this.preencherCampos(endereco);
        this.cepStatus = 'success';
      } catch (error) {
        this.cepStatus = 'error';
        console.error('Erro ao buscar CEP:', error);
      }
    }
  }
  
  private preencherCampos(endereco: any) {
    this.enderecoForm.patchValue({
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.uf
    });
  }
}
```

## Tipos de Endereço

O campo `tipo` define a categoria do endereço:

| Tipo | Descrição | Uso |
| --- | --- | --- |
| `RESIDENCIAL` | Endereço residencial do usuário. | Endereço de moradia principal ou secundária. |
| `COMERCIAL` | Endereço comercial/trabalho. | Local de trabalho ou empresa. |
| `ENTREGA` | Endereço específico para entregas. | Endereços alternativos para recebimento de produtos. |
| `COBRANCA` | Endereço para cobrança/faturamento. | Endereço fiscal ou de cobrança. |
| `TEMPORARIO` | Endereço temporário. | Endereços de uso temporário (viagens, etc.). |
| `OUTRO` | Outros tipos de endereço. | Categoria genérica para casos especiais. |

## Regras de Negócio

### Endereço Principal
- Cada usuário pode ter apenas **um endereço principal** por vez
- Ao definir um endereço como principal, o anterior automaticamente deixa de ser principal
- O primeiro endereço cadastrado é automaticamente definido como principal
- Um usuário deve ter pelo menos um endereço ativo

### Limites
- Máximo de **10 endereços** por usuário
- Endereços inativos não contam para o limite

### Validações
- CEP deve seguir formato brasileiro: 00000-000
- Estado deve ser uma UF válida
- Não é possível desativar o último endereço ativo do usuário
- Não é possível excluir o endereço principal (deve definir outro como principal primeiro)
- **Integração BuscaCEP:** Validação automática de CEP via API externa

## Endpoints

### 1. Listar Endereços do Usuário

- **Endpoint:** `GET /users/{userId}/enderecos`
- **Descrição:** Lista todos os endereços de um usuário específico.
- **Permissões:** Usuário pode ver apenas seus próprios endereços, ADMIN pode ver de qualquer usuário.
- **Parâmetros de Query:**
  - `ativo` (opcional): Filtrar por endereços ativos/inativos (true/false)
  - `tipo` (opcional): Filtrar por tipo de endereço
- **Resposta de Sucesso (200 OK):**
  ```json
  {
    "enderecos": [
      {
        "enderecoId": "clx1234567890",
        "userId": "clx0987654321",
        "tipo": "RESIDENCIAL",
        "nome": "Casa",
        "logradouro": "Rua das Flores",
        "numero": "123",
        "complemento": "Apto 45",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "estado": "SP",
        "cep": "01234-567",
        "pontoReferencia": "Próximo ao shopping",
        "principal": true,
        "ativo": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 1
  }
  ```
- **Nota sobre Resposta Vazia:** Se o usuário não possuir endereços cadastrados, o endpoint retornará uma resposta de sucesso (`200 OK`) com uma lista vazia (`"enderecos": []`) e `total: 0`.
- **Resposta de Erro (403 Forbidden):** Se tentar acessar endereços de outro usuário sem ser ADMIN.
- **Resposta de Erro (404 Not Found):** Se o usuário não for encontrado.

### 2. Obter Endereço Específico

- **Endpoint:** `GET /enderecos/{enderecoId}`
- **Descrição:** Obtém detalhes de um endereço específico.
- **Permissões:** Usuário pode ver apenas seus próprios endereços, ADMIN pode ver qualquer endereço.
- **Resposta de Sucesso (200 OK):** Objeto do endereço
- **Resposta de Erro (403 Forbidden):** Se tentar acessar endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

### 3. Criar Novo Endereço

- **Endpoint:** `POST /users/{userId}/enderecos`
- **Descrição:** Cria um novo endereço para o usuário.
- **Permissões:** Usuário pode criar apenas para si mesmo, ADMIN pode criar para qualquer usuário.
- **Corpo da Requisição:**
  ```json
  {
    "tipo": "RESIDENCIAL",
    "nome": "Casa",
    "logradouro": "Rua das Flores",
    "numero": "123",
    "complemento": "Apto 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01234-567",
    "pontoReferencia": "Próximo ao shopping",
    "principal": false
  }
  ```
- **Resposta de Sucesso (201 Created):** Objeto do endereço criado
- **Resposta de Erro (400 Bad Request):** Dados inválidos ou limite de endereços excedido.
- **Resposta de Erro (403 Forbidden):** Se tentar criar endereço para outro usuário.

### 4. Atualizar Endereço

- **Endpoint:** `PUT /enderecos/{enderecoId}`
- **Descrição:** Atualiza um endereço existente.
- **Permissões:** Usuário pode atualizar apenas seus próprios endereços, ADMIN pode atualizar qualquer endereço.
- **Corpo da Requisição:** Mesma estrutura do POST (campos opcionais)
- **Resposta de Sucesso (200 OK):** Objeto do endereço atualizado
- **Resposta de Erro (400 Bad Request):** Dados inválidos.
- **Resposta de Erro (403 Forbidden):** Se tentar atualizar endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

### 5. Definir Endereço como Principal

- **Endpoint:** `PATCH /enderecos/{enderecoId}/principal`
- **Descrição:** Define um endereço como principal do usuário.
- **Permissões:** Usuário pode definir apenas seus próprios endereços, ADMIN pode definir qualquer endereço.
- **Resposta de Sucesso (200 OK):** Objeto do endereço atualizado
- **Resposta de Erro (403 Forbidden):** Se tentar definir endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

### 6. Desativar Endereço

- **Endpoint:** `PATCH /enderecos/{enderecoId}/desativar`
- **Descrição:** Desativa um endereço (soft delete).
- **Permissões:** Usuário pode desativar apenas seus próprios endereços, ADMIN pode desativar qualquer endereço.
- **Resposta de Sucesso (200 OK):** Objeto do endereço atualizado
- **Resposta de Erro (400 Bad Request):** Se tentar desativar o último endereço ativo.
- **Resposta de Erro (403 Forbidden):** Se tentar desativar endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

### 7. Reativar Endereço

- **Endpoint:** `PATCH /enderecos/{enderecoId}/reativar`
- **Descrição:** Reativa um endereço desativado.
- **Permissões:** Usuário pode reativar apenas seus próprios endereços, ADMIN pode reativar qualquer endereço.
- **Resposta de Sucesso (200 OK):** Objeto do endereço atualizado
- **Resposta de Erro (400 Bad Request):** Se exceder o limite de endereços ativos.
- **Resposta de Erro (403 Forbidden):** Se tentar reativar endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

### 8. Excluir Endereço

- **Endpoint:** `DELETE /enderecos/{enderecoId}`
- **Descrição:** Exclui permanentemente um endereço.
- **Permissões:** Usuário pode excluir apenas seus próprios endereços, ADMIN pode excluir qualquer endereço.
- **Resposta de Sucesso (204 No Content)**
- **Resposta de Erro (400 Bad Request):** Se tentar excluir o endereço principal ou último endereço ativo.
- **Resposta de Erro (403 Forbidden):** Se tentar excluir endereço de outro usuário.
- **Resposta de Erro (404 Not Found):** Se o endereço não for encontrado.

## Integração com Outros Módulos

### Cadastro de Pets (ExpoDog)
Quando um usuário cadastra um pet, o sistema pode:
- Usar o endereço principal do usuário como padrão
- Permitir seleção de endereço específico para o pet
- Criar novo endereço temporário se necessário
- **Utilizar BuscaCEP:** Para facilitar o preenchimento de novos endereços durante o cadastro

### Assinaturas e Entregas
- Endereços do tipo `ENTREGA` são priorizados para envio de revistas
- Endereços do tipo `COBRANCA` são usados para faturamento
- Sistema de fallback: ENTREGA → PRINCIPAL → RESIDENCIAL

## Exemplos de Uso

### Fluxo de Cadastro de Endereço com BuscaCEP
1. **Usuário acessa formulário:** Visualiza campos de endereço
2. **Digita CEP:** Sistema busca automaticamente via BuscaCEP
3. **Campos preenchidos:** Logradouro, bairro, cidade e estado são preenchidos
4. **Usuário completa:** Adiciona número, complemento e outros dados
5. **Salva endereço:** `POST /users/{userId}/enderecos`
6. **Define como principal:** `PATCH /enderecos/{enderecoId}/principal` (se necessário)

### Fluxo de Mudança
1. **Cadastra novo endereço:** `POST /users/{userId}/enderecos`
2. **Define como principal:** `PATCH /enderecos/{enderecoId}/principal`
3. **Desativa endereço antigo:** `PATCH /enderecos/{enderecoId}/desativar`

## Códigos de Erro Específicos

| Código | Descrição |
| --- | --- |
| `ENDERECO_001` | Limite máximo de endereços excedido (10 por usuário) |
| `ENDERECO_002` | Não é possível desativar o último endereço ativo |
| `ENDERECO_003` | Não é possível excluir o endereço principal |
| `ENDERECO_004` | CEP inválido |
| `ENDERECO_005` | Estado (UF) inválido |
| `ENDERECO_006` | Tipo de endereço inválido |
| `ENDERECO_007` | Endereço não pertence ao usuário |
| `ENDERECO_008` | Erro na consulta BuscaCEP (frontend) |
| `ENDERECO_009` | CEP não encontrado na base de dados (frontend) |

## Notas de Implementação

### Segurança
- Todos os endpoints requerem autenticação
- Validação rigorosa de propriedade do endereço
- Logs de auditoria para todas as operações

### Performance
- Índices em `userId` e `principal` para consultas rápidas
- Cache de endereço principal por usuário
- Paginação em listagens quando necessário
- **BuscaCEP:** Cache local de CEPs consultados para melhor performance

### Validações
- CEP deve seguir formato brasileiro: 00000-000
- Estado deve ser UF válida (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO)
- Logradouro, número, bairro, cidade são obrigatórios
- Tipo deve ser um dos valores válidos definidos

### Integração com APIs Externas
- **BuscaCEP (Frontend):** Preenchimento automático de endereços via CEP
- Validação de CEP via API dos Correios (opcional - backend)
- Geocodificação para coordenadas (futuro)
- Validação de endereço via Google Maps API (futuro)

### Considerações de UX
- Interface responsiva para diferentes dispositivos
- Feedback visual claro durante busca de CEP
- Possibilidade de edição manual mesmo com preenchimento automático
- Validação em tempo real dos campos obrigatórios
