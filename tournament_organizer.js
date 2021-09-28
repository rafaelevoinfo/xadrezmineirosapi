const { EventManager } = require("tournament-organizer");
const { Rodada, Partida, Jogador } = require("./models/types");
const { Log, LogLevel } = require("./log");
const { LichessApi } = require('./lichess-api.js');

module.exports = class TournamentOrganizer {

  constructor(){    
    this.chessApi = new LichessApi();
  }

  criarTorneioSuico(ipTorneio) {
    let torneioManager = new EventManager();
    const vaTorneioSwiss = torneioManager.createTournament(null, {
      name: ipTorneio.nome,
      format: "swiss",
      dutch: true,
      seedOrder: "des",
      seededPlayers: true,
      numberOfRounds: ipTorneio.qtde_rodadas,
    });

    for (const vaJogador of ipTorneio.jogadores) {
      vaTorneioSwiss.addPlayer(
        vaJogador.nome,
        vaJogador.username,
        vaJogador.rating
      );
    }

    vaTorneioSwiss.startEvent();

    //vamos alimentar o vaTorneioSwiss com as informações que ja temos
    if (ipTorneio.rodadas && ipTorneio.rodadas.length > 0) {
      for (let i = 0; i < ipTorneio.rodadas.length; i++) {
        let vaRodada = ipTorneio.rodadas[i];
        let vaMatches = vaTorneioSwiss.activeMatches(i + 1);
        for (const vaMatch of vaMatches) {
          let vaPartida = vaRodada.partidas.find((p) => {
            return (
              p.jogadorBrancas.username == vaMatch.playerOne.id &&
              p.jogadorNegras.username == vaMatch.playerTwo.id
            );
          });

          if (vaPartida && vaPartida.resultado) {
            let vaPlayerOneWins = vaPartida.resultado == "1-0" ? 1 : 0;
            let vaPlayerTwoWins = vaPartida.resultado == "0-1" ? 1 : 0;

            vaTorneioSwiss.result(vaMatch, vaPlayerOneWins, vaPlayerTwoWins);
          }
        }
      }
    }

    return vaTorneioSwiss;
  }

  async processarRodada(ipTorneio) {
    let vaResult = false;
    let vaTorneioSwiss = this.criarTorneioSuico(ipTorneio);

    //vamos pegar a proxima rodada se disponivel
    if (vaTorneioSwiss.currentRound >= 0 && vaTorneioSwiss.active) {
      //se true, indica que uma nova rodada começou
      if (ipTorneio.rodada_atual < vaTorneioSwiss.currentRound) {
        let vaMatches = vaTorneioSwiss.activeMatches(
          vaTorneioSwiss.currentRound
        );

        if (vaMatches && vaMatches.length > 0) {
          let vaRodada = new Rodada();
          vaRodada.data_inicio = new Date();
          vaRodada.numero = vaMatches[0].round; //sera sempre o mesmo valor
          ipTorneio.rodada_atual = vaRodada.numero;
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
      }

      if (await this.buscarResultados(ipTorneio)){
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
