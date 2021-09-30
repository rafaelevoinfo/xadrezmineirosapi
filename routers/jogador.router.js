const JogadorController = require('../controllers/jogador.controller')
const authorize = require("../controllers/auth.controller");
const { Log } = require('../log');

function addRotas(app) {
    app.get('/jogador/:username', async (req, res) => {        
        if (await authorize(req, res)) {            
            let vaController = new JogadorController();
            let vaResult = await vaController.buscarJogador(req.params.username);
            if (vaResult) {
                res.status(200).send(vaResult)
            } else {
                res.status(404).send()
            }
        }
    });
}

exports.addRotasJogador = addRotas;