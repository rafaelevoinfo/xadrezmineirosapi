const jwt = require('jsonwebtoken')
const {Log} = require('../log')

async function authorize(req, res, authServer) {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({
            auth: false,
            message: 'Token não informado.'
        });
        return false
    }
    let vaResult = false;
        
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            res.status(500).json({
                auth: false,
                message: err.message == "jwt expired" ? "expirado" : "token inválido"
            });
            return;
        }

        Log.logInfo("Token: "+token);
        // se tudo estiver ok, salva no request para uso posterior
        req.email = decoded.email;
        vaResult = true;
    });

    return vaResult;
}

module.exports = authorize