const { EventManager } = require("tournament-organizer");
const { Rodada, Partida, Jogador, TIPO_TORNEIO_SUICO, TIPO_TORNEIO_PONTOS_CORRIDOS } = require("./models/types");
const { Log, LogLevel } = require("./log");
const { LichessApi } = require('./lichess-api.js');

module.exports = class TournamentOrganizer {

  constructor() {
    this.chessApi = new LichessApi();
  }

  criarTorneio(ipTorneio) {
    let torneioManager = new EventManager();
    let vaTorneio = undefined;
    if (ipTorneio.tipo == TIPO_TORNEIO_SUICO) {
      vaTorneio = torneioManager.createTournament(null, {
        name: ipTorneio.nome,
        format: "swiss",
        dutch: true,
        seedOrder: "des",
        seededPlayers: true,
        numberOfRounds: ipTorneio.qtde_rodadas,
      });
    } else if (ipTorneio.tipo == TIPO_TORNEIO_PONTOS_CORRIDOS) {
      vaTorneio = torneioManager.createTournament(null, {
        name: ipTorneio.nome,
        format: "pontos-corridos",
        seededPlayers: true,
        numberOfPhases: ipTorneio.qtde_rodadas,
      });
    }

    for (const vaJogador of ipTorneio.jogadores) {
      vaTorneio.addPlayer(
        vaJogador.nome,
        vaJogador.username,
        vaJogador.rating
      );
    }

    vaTorneio.startEvent();

    //vamos alimentar o vaTorneio com as informações que ja temos
    if (ipTorneio.tipo == TIPO_TORNEIO_PONTOS_CORRIDOS){
      //aqui a qtde_rodadas representa as fases, entao preciso ir pecorrendo fase a fase para ir gerando as proximas
      for (let i = 0; i < ipTorneio.qtde_rodadas; i++) {
        this.carregarResultadosPartidas(ipTorneio, vaTorneio)  
      }
    } else{
      this.carregarResultadosPartidas(ipTorneio, vaTorneio)
    }
    return vaTorneio;
  }

  carregarResultadosPartidas(ipTorneioFirebase, ipTorneio){
    if (ipTorneioFirebase.rodadas && ipTorneioFirebase.rodadas.length > 0) {
      for (let i = 0; i < ipTorneioFirebase.rodadas.length; i++) {
        let vaRodada = ipTorneioFirebase.rodadas[i];
        let vaMatches = ipTorneio.activeMatches(vaRodada.numero);
        for (const vaMatch of vaMatches) {
          if ((!vaRodada.fase) || (vaMatch.phase == vaRodada.fase)) {
            let vaPartida = vaRodada.partidas.find((p) => {
              return (
                p.jogadorBrancas.username == vaMatch.playerOne.id &&
                p.jogadorNegras.username == vaMatch.playerTwo.id
              );
            });

            if (vaPartida && vaPartida.resultado) {
              let vaPlayerOneWins = vaPartida.resultado == "1-0" ? 1 : 0;
              let vaPlayerTwoWins = vaPartida.resultado == "0-1" ? 1 : 0;

              ipTorneio.result(vaMatch, vaPlayerOneWins, vaPlayerTwoWins);
            }
          }
        }
        ipTorneio.nextRound();
      }
    }
  }

  calcularPontuacao(ipTorneio) {
    let vaTorneio = this.criarTorneio(ipTorneio);
    let vaJogadores = vaTorneio.standings();
    for (const vaJog of vaJogadores) {
      let vaJogador = ipTorneio.jogadores.find((j) => j.username == vaJog.id);
      if (vaJogador) {
        vaJogador.pontos = vaJog.matchPoints;
      }
    }
  }

  async processarRodada(ipTorneio) {
    let vaResult = false;
    let vaTorneio = this.criarTorneio(ipTorneio);

    //avanca para o proximo round se necessario
    vaTorneio.nextRound();
    //vamos pegar a proxima rodada se disponivel
    if (vaTorneio.currentRound >= 0 && vaTorneio.active) {
      //se true, indica que uma nova rodada começou
      if (ipTorneio.rodada_atual < vaTorneio.currentRound + (vaTorneio.numberOfRounds * (vaTorneio.currentPhase?vaTorneio.currentPhase-1:0))) {
        let vaMatches = vaTorneio.activeMatches(
          vaTorneio.currentRound
        );

        if (vaMatches && vaMatches.length > 0) {
          let vaRodada = new Rodada();
          vaRodada.data_inicio = new Date();
          vaRodada.numero = vaMatches[0].round; //sera sempre o mesmo valor
          vaRodada.fase = vaMatches[0].phase;
          ipTorneio.rodada_atual++;
          for (const vaMatch of vaMatches) {
            let vaPartida = new Partida();
            vaPartida.jogadorBrancas = new Jogador();
            vaPartida.jogadorBrancas.nome = vaMatch.playerOne.alias;
            vaPartida.jogadorBrancas.username = vaMatch.playerOne.id;

            vaPartida.jogadorNegras = new Jogador();
            vaPartida.jogadorNegras.nome = vaMatch.playerTwo.alias;
            vaPartida.jogadorNegras.username = vaMatch.playerTwo.id;

            vaRodada.partidas.push(vaPartida);
          }

          ipTorneio.rodadas.push(vaRodada);
          vaResult = true;
        }
      } else if ((vaTorneio.currentRound == vaTorneio.numberOfRounds) && 
                 ((ipTorneio.tipo != TIPO_TORNEIO_PONTOS_CORRIDOS) ||
                  (ipTorneio.qtde_rodadas == vaTorneio.currentPhase))) {
        let vaMatches = vaTorneio.activeMatches(
          vaTorneio.currentRound
        );
        if (vaMatches.length == 0) {
          vaTorneio.active = false;
          ipTorneio.status = 2;
          vaResult = true;
        }
      }

      if (await this.buscarResultados(ipTorneio)) {
        vaResult = true;
      }
      
    } else {
      ipTorneio.status = 2;
      vaResult = true;
    }
    return vaResult;
  }

  async buscarResultados(ipTorneio) {
    let vaResult = false;
    let vaRodada = ipTorneio.rodadas[ipTorneio.rodada_atual - 1];
    if (vaRodada) {
      for (const vaPartida of vaRodada.partidas) {
        if (await this.pegarResultado(ipTorneio, vaRodada, vaPartida)) {
          vaResult = true;
        }
      }
    }

    return vaResult;
  }

  async pegarResultado(ipTorneio, ipRodada, ipPartida) {
    let vaResultados = await this.chessApi.pegarResultadoJogos(ipPartida.jogadorBrancas.username, {
      vs: ipPartida.jogadorNegras.username,
      max: 1,
      rated: true,
      since: ipRodada.data_inicio.getTime(),
      ritmo: ipTorneio.ritmo,
      color: 'white'
    });

    if (vaResultados && (vaResultados.length > 0)) {
      ipPartida.resultado = vaResultados[0].resultado;
      ipPartida.link = vaResultados[0].link_partida;
      return true;
    }

    return false;
  }
};
