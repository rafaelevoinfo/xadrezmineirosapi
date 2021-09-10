const TorneioController = require("../controllers/torneios.controller");
const authorize = require("../controllers/auth.controller");
const TournamentOrganizer = require("../tournament_organizer");

function instanciarController(ipDb) {
  return new TorneioController(ipDb);
}

function addRotas(app, db) {
  app.get("/torneios", async (req, res) => {
    let vaController = instanciarController(db);
    let vaTorneios = await vaController.buscarTorneios(!req.query.inativos);
    res.status(200).send(vaTorneios);
  });

  app.put("/torneio/start/:id", async (req, res) => {
    if (authorize(req, res)) {
      let vaController = instanciarController(db);
      let vaTorneio = await vaController.buscarTorneio(req.params.id);
      if (vaTorneio) {
        vaTorneio.status = 1;
        let vaOrganizer = new TournamentOrganizer();
        if (vaOrganizer.processarRodada(vaTorneio)) {
          let vaSalvou = await vaController.atualizarTorneio(
            req.params.id,
            vaTorneio
          );
          if (vaSalvou) {
            res.status(200).send();
          } else {
            res
              .status(404)
              .send({ error: "Não foi possível salvar o registro." });
          }
        } else {
          res
            .status(500)
            .send({
              error:
                "Não foi possível criar os emparceiramentos da primeira rodada.",
            });
        }
      } else {
        res.status(404).send();
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
      console.log(req.body)  
      if (authorize(req, res)) {
        let vaController = instanciarController(db);
      
        let vaSalvou = await vaController.atualizarTorneio(
          req.params.id,
          req.body
        );
        if (vaSalvou) {
          res.status(200).send();
        } else {
          res.status(404).send('Não foi possível salvar o torneio.');
        }
      }
    })
    .delete(async (req, res) => {
      if (authorize(req, res)) {
        let vaController = instanciarController(db);
        let vaSalvou = await vaController.excluirTorneio(req.params.id);
        if (vaSalvou) {
          res.status(200).send();
        } else {
          res.status(404).send('Torneio não foi excluído.');
        }
      }
    });

  app.post("/torneio", async (req, res) => {
    if (authorize(req, res)) {
      let vaController = instanciarController(db);
      let vaId = await vaController.incluirTorneio(req.body);
      if (vaId){
        res.status(200).send(vaId);
      }else{
        res.status(500).send('Torneio não foi salvo.');
      }
      
    }
  });
}

exports.addRotasTorneio = addRotas;
