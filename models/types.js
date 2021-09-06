class Torneio {
    id;
    nome;
    qtde_rodadas;
    status;
    data_inicio;    
    rodada_atual;
    ritmo;
    descricao;

    constructor() {
        this.jogadores = [];
        this.rodadas = [];
        this.status = -1;
        this.rodada_atual = -1;
    }

    getDescricaoStatus() {
        switch (this.status) {
            case 0: return 'Criado';
            case 1: return 'Em andamento';
            default: return 'Finalizado';
        }
    }
}

class Jogador {
    nome;
    username;
    rating;
}

class Partida {
    jogadorBrancas;
    jogadorNegras;
    resultado;
    link;
}

class Rodada {
    numero;
    partidas;
    data_inicio;

    constructor() {
        this.partidas = [];
    }
}


module.exports = {Torneio, Rodada, Jogador, Partida}