# XadrezmineirosAPI
API para acesso do site XadrezMineiros

## Endpoints
### GET /torneios  
Busca todos os torneios existentes.  
É possível realizar filtros passando na URL os parâmetros. **inativos** e **nome**  
Exemplo:  
https://xadrez-mineiros.herokuapp.com/torneios?inativos=false&nome=Setembro  

### GET /torneio/:id  
Busca as informações de um torneio.  

### POST /torneio  
Inclui um novo torneio e retorna seu ID.

### DELETE /torneio/:id  
Exclui um torneio.  

### PUT /torneio  
Altera um torneio.  

### PUT /torneio/start/:id  
Inicia um torneio e gera os emparceiramentos da primeira rodada.  



