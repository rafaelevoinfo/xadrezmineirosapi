const TorneioController = require("../controllers/torneios.controller");
const authorize = require("../controllers/auth.controller");
const TournamentOrganizer = require("../tournament_organizer");

function instanciarController(ipDb) {
  return new TorneioController(ipDb);
}

function addRotas(app, db) {
  app.get("/torneios", async (req, res) => {
    let vaController = instanciarController(db);
    let vaTorneios = await vaController.buscarTorneios(req.query);
    res.status(200).send(vaTorneios);
  });

  app.put("/torneio/start/:id", async (req, res) => {
    if (await authorize(req, res)) {
      let vaController = instanciarController(db);
      await vaController.iniciarTorneio(req.params.id);
      res.status(200).send()
    }
  });

  app.get("/torneio/processar/:id", async (req, res) => {
    if (await authorize(req, res)) {
      let vaController = instanciarController(db);
      let vaTorneio = await vaController.processarTorneio(req.params.id);
      if (vaTorneio){
        res.status(200).send(vaTorneio)
      }else{
        res.status(204).send();
      }      
    }
  });

  app
    .route("/torneio/:id")
    .get(async (req, res) => {
      let vaController = instanciarController(db);
      let vaTorneios = await vaController.buscarTorneio(req.params.id);
      res.status(200).send(vaTorneios);
    })
    .put(async (req, res) => {      
      if (await authorize(req, res)) {
        let vaController = instanciarController(db);

        let vaSalvou = await vaController.atualizarTorneio(
          req.params.id,
          req.body
        );
        if (vaSalvou) {
          res.status(200).send();
        } else {
          res.status(404).send("Não foi possível salvar o torneio.");
        }
      }
    })
    .delete(async (req, res) => {
      if (await authorize(req, res)) {
        let vaController = instanciarController(db);
        let vaSalvou = await vaController.excluirTorneio(req.params.id);
        if (vaSalvou) {
          res.status(200).send();
        } else {
          res.status(404).send("Torneio não foi excluído.");
        }
      }
    });

  app.post("/torneio", async (req, res) => {
    if (await authorize(req, res)) {
      let vaController = instanciarController(db);
      let vaId = await vaController.incluirTorneio(req.body);
      if (vaId) {
        res.status(200).send(vaId);
      } else {
        res.status(500).send("Torneio não foi salvo.");
      }
    }
  });
}

exports.addRotasTorneio = addRotas;
