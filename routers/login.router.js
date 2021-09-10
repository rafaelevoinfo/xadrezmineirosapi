const LoginController = require('../controllers/login.controller')

function addRotas(app, auth, authServer) {
    app.post('/login', async (req, res) => {
        let vaController = new LoginController(auth, authServer);
        let vaResult = await vaController.login(req.body);
        if (vaResult.auth) {
            res.status(200).send(vaResult)
        }else{
            res.status(401).send(vaResult)
        }
    });
}

exports.addRotasLogin = addRotas;