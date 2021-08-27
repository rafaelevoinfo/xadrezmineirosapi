const TorneioController = require('../controllers/torneios.controller')
const authorize = require('../controllers/auth.controller')

function instanciarController(ipDb) {
    return new TorneioController(ipDb);
}

function addRotas(app, db) {
    app.get('/torneios', async (req, res) => {
        let vaController = instanciarController(db);
        let vaTorneios = await vaController.buscarTorneios(!req.query.inativos);
        res.status(200).send(vaTorneios);
    });

    app.route('/torneio/:id')
        .get(async (req, res) => {
            let vaController = instanciarController(db);
            let vaTorneios = await vaController.buscarTorneio(req.params.id);
            res.status(200).send(vaTorneios);
        })
        .put(async (req, res) => {
            if (authorize(req, res)) {
                let vaController = instanciarController(db);
                let vaSalvou = await vaController.atualizarTorneio(req.params.id, req.body);
                if (vaSalvou) {
                    res.status(200).send();
                } else {
                    res.status(404).send();
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
                    res.status(404).send();
                }
            }
        })

    app.post('/torneio', async (req, res) => {
        if (authorize(req, res)) {
            let vaController = instanciarController(db);
            let vaId = await vaController.incluirTorneio(req.body);
            res.status(200).send(vaId);
        }
    })

}

exports.addRotasTorneio = addRotas;