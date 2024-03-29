require("dotenv").config();
const TournamentOrganizer = require("./tournament_organizer");
const TorneioController = require("./controllers/torneios.controller");
const { firebase_admin } = require("./firebase");
const { Log, LogLevel } = require("./log");

async function verificarJogos() {
  Log.logInfo("Buscando torneios em aberto!", LogLevel.RELEASE);
  let vaController = new TorneioController(firebase_admin.firestore());
  let vaTorneios = await vaController.buscarTorneiosPorStatus(1); //apenas torneios em andamento
  if (vaTorneios) {
    let vaOrganizer = new TournamentOrganizer();
    for (const vaTorneio of vaTorneios) {
      Log.logInfo("Torneio encontrado.", LogLevel.DEBUG, vaTorneio);
      let vaProcessou = await vaOrganizer.processarRodada(vaTorneio);
      if (vaProcessou) {
        Log.logInfo(
          "Torneio processado. Atualizando banco de dados.",
          LogLevel.DEBUG,
          vaTorneio
        );
        await vaController.atualizarTorneio(vaTorneio.id, vaTorneio);
      }
    }
  }
}

async function deletar() {
  let vaController = new TorneioController(firebase_admin.firestore());
  let vaTorneios = await vaController.buscarTorneiosPorStatus(1); //apenas torneios em andamento
  if (vaTorneios) {
    let vaOrganizer = new TournamentOrganizer();
    for (const vaTorneio of vaTorneios) {
      Log.logInfo("Torneio encontrado.", LogLevel.DEBUG, vaTorneio);
      for (let index = vaTorneio.rodadas.length - 1; index >= 0; index--) {
        if (index > 4)
          vaTorneio.rodadas.splice(index, 1);
      }
      await vaController.atualizarTorneio(vaTorneio.id, vaTorneio);

    }
  }
}

verificarJogos();
