# Padrão de Códigos de Status HTTP

## Sucesso

- **200 OK**: O raro momento em que tudo funciona.
- **201 Created**: Criado. E você jurando que não ia dar certo.
- **204 No Content**: OK, mas sem resposta... tipo ghosting.

## Redirecionamento

- **301 Moved Permanently**: Mudou de endereço, mas te avisa.
- **302 Found**: Mudou temporariamente (vida de nômade).

## Erro do Cliente

- **400 Bad Request**: A culpa é do usuário. Sempre.
- **401 Unauthorized**: Você não tem permissão, jovem gafanhoto.
- **403 Forbidden**: Mesmo com permissão, não entra.
- **404 Not Found**: O clássico: só existe em produção.

## Erro do Servidor

- **500 Internal Server Error**: Hora de culpar a infra.
- **501 Not Implemented**: “Ainda não implementado” (e talvez nunca seja).
- **502 Bad Gateway**: O servidor surtou, tente mais tarde.
- **503 Service Unavailable**: O serviço decidiu tirar férias.
- **504 Gateway Timeout**: O servidor está te ignorando.
