# Documentação para Cadastro de Cães com Upload Local

Este documento detalha o fluxo de criação de um novo cadastro de cão, utilizando o envio de arquivos via `multipart/form-data` e o processamento de mídia em segundo plano.

## Fluxo Geral

1.  **Frontend envia o formulário:** O cliente (frontend) envia todos os dados do formulário, incluindo as imagens e o vídeo, em uma única requisição `POST` do tipo `multipart/form-data`.
2.  **Backend responde imediatamente:** O backend recebe a requisição, realiza validações síncronas (como a duração do vídeo), salva o registro do cão com um status `PROCESSANDO` e retorna uma resposta de sucesso **imediatamente** para o frontend.
3.  **Backend processa a mídia em segundo plano:** Um processo assíncrono é iniciado no servidor para otimizar as imagens e mover o vídeo para o local de armazenamento permanente.
4.  **Backend atualiza o registro:** Ao final do processamento, o registro do cão é atualizado com as URLs finais dos arquivos e o status é alterado para `PENDENTE` (pronto para aprovação) ou `REJEITADO` (se houver erro no processamento).

## Rota de Criação de Cadastro

-   **Endpoint:** `POST /cadastro-cao`
-   **Autenticação:** Obrigatória (Bearer Token)
-   **Content-Type:** `multipart/form-data`

### Campos do Formulário (`multipart/form-data`)

| Campo             | Tipo      | Obrigatório? | Descrição                                                                                                  |
| ----------------- | --------- | ------------ | ---------------------------------------------------------------------------------------------------------- |
| `nome`            | `string`  | **Sim**      | Nome do cão.                                                                                               |
| `sexo`            | `Enum`    | **Sim**      | Sexo do cão. Valores permitidos: `MACHO`, `FEMEA`.                                                         |
| `dataNascimento`  | `string`  | **Sim**      | Data de nascimento do cão, no formato `YYYY-MM-DD`.                                                        |
| `fotoPerfil`      | `file`    | **Sim**      | Arquivo de imagem para a foto de perfil.                                                                   |
| `fotoLateral`     | `file`    | **Sim**      | Arquivo de imagem para a foto lateral.                                                                     |
| `racaId`          | `string`  | Condicional  | ID de uma raça já existente. Obrigatório se `racaSugerida` não for preenchido.                             |
| `racaSugerida`    | `string`  | Condicional  | Nome de uma nova raça a ser sugerida. Obrigatório se `racaId` não for preenchido.                          |
| `proprietarioId`  | `string`  | Opcional     | ID do usuário proprietário. Se não for fornecido, o cão será associado ao usuário que fez a requisição.   |
| `video`           | `file`    | Opcional     | Arquivo de vídeo do cão (limite de 30 segundos).                                                           |
| `...`             | `...`     | `...`        | Todos os outros campos (`peso`, `altura`, `temPedigree`, etc.) também são enviados como parte do formulário. |

### Exibindo o Progresso do Upload no Frontend

Bibliotecas como o `axios` permitem monitorar o progresso do upload de uma requisição `multipart/form-data`, o que é ideal para exibir uma barra de progresso.

```javascript
const formData = new FormData();
formData.append('nome', 'Rex');
formData.append('fotoPerfil', fileInput.files[0]);
// ... anexe todos os outros campos

const onUploadProgress = (progressEvent) => {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  console.log(`Upload: ${percentCompleted}%`);
};

await axios.post('/cadastro-cao', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress,
});
```

### Resposta Imediata de Sucesso (201 Created)

O backend responderá com o objeto do cão cadastrado, mas com o `status: 'PROCESSANDO'` e URLs de placeholder, indicando que a mídia ainda não foi finalizada.

```json
{
  "cadastroId": "clz12345...",
  "nome": "Rex",
  "status": "PROCESSANDO",
  "fotoPerfil": "placeholder.jpg",
  "fotoLateral": "placeholder.jpg",
  // ...outros dados
}
```

O frontend pode usar essa resposta para redirecionar o usuário para uma página de "cadastro em processamento" ou similar, e então consultar o status do cadastro periodicamente para saber quando a mídia foi processada.
