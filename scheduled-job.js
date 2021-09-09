require('dotenv').config();
const TournamentOrganizer = require('./tournament_organizer')
const TorneioController = require("./controllers/torneios.controller");
const firebase = require("./firebase");
const {Log, LogLevel} = require('./log')



async function verificarJogos() {      
  firebase.auth().signInWithEmailAndPassword(process.env.FIREBASE_EMAIL, process.env.FIREBASE_SENHA).then(async r => {
    Log.logInfo("Buscando torneios em aberto!", LogLevel.RELEASE);
    let vaController = new TorneioController(firebase.firestore());
    let vaTorneios = await vaController.buscarTorneiosPorStatus(1);//apenas torneios em andamento
    if (vaTorneios) {
      let vaOrganizer = new TournamentOrganizer();
      for (const vaTorneio of vaTorneios) {
        Log.logInfo("Torneio encontrado.", LogLevel.DEBUG, vaTorneio);
        let vaProcessou = vaOrganizer.processarRodada(vaTorneio);
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