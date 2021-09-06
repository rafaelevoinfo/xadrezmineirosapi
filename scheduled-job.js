require('dotenv').config();
const {EventManager} = require("tournament-organizer");
const {Torneio, Rodada, Partida, Jogador} = require("./models/types");
const TorneioController = require("./controllers/torneios.controller");
const firebase = require("./firebase");
const {Log, LogLevel} = require('./log')

function criarTorneioSuico(ipTorneio) {
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

function processarRodada(ipTorneio) {
  let vaResult = false;
  let vaTorneioSwiss = criarTorneioSuico(ipTorneio);

  //vamos pegar a proxima rodada se disponivel
  if (vaTorneioSwiss.currentRound >= 0 && vaTorneioSwiss.active) {
    //se true, indica que uma nova rodada começou
    if (ipTorneio.rodada_atual < vaTorneioSwiss.currentRound) {
      let vaMatches = vaTorneioSwiss.activeMatches(vaTorneioSwiss.currentRound);

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
  } else {
    ipTorneio.status = 2;
    vaResult = true;
  }
  return vaResult;
}

async function verificarJogos() {      
  firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_SENHA).then(async r => {
    Log.logInfo("Buscando torneios em aberto!", LogLevel.RELEASE);
    let vaController = new TorneioController(firebase.firestore());
    let vaTorneios = await vaController.buscarTorneiosPorStatus(1);//apenas torneios em andamento
    if (vaTorneios) {
      for (const vaTorneio of vaTorneios) {
        Log.logInfo("Torneio encontrado.", LogLevel.DEBUG, vaTorneio);
        let vaProcessou = processarRodada(vaTorneio);
        if (vaProcessou) {
          Log.logInfo('Torneio processado. Atualizando banco de dados.', LogLevel.DEBUG, vaTorneio)
          vaController.atualizarTorneio(vaTorneio.id, vaTorneio);
        }
      }
    }
  })
  .catch(error =>{
    Log.logError('Não foi possível autenticar no firebase', LogLevel.RELEASE, error);
  });
  
}

verificarJogos();