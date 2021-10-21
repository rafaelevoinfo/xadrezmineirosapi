const TIPO_TORNEIO_SUICO = 0;
const TIPO_TORNEIO_PONTOS_CORRIDOS = 1;


class Torneio {
    id;
    nome;
    qtde_rodadas;
    status;
    data_inicio;    
    rodada_atual;
    ritmo;
    tipo;
    descricao;

    constructor() {
        this.jogadores = [];
        this.rodadas = [];
        this.status = -1;
        this.rodada_atual = -1;
        this.tipo = TIPO_TORNEIO_SUICO;
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
    pontos;
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
    fase;

    constructor() {
        this.partidas = [];
    }
}


module.exports = {Torneio, Rodada, Jogador, Partida, TIPO_TORNEIO_SUICO, TIPO_TORNEIO_PONTOS_CORRIDOS}