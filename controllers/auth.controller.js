const jwt = require('jsonwebtoken')

function authorize(req, res) {
    const token = req.headers['x-access-token'];
    if (!token) {
        res.status(401).json({
            auth: false,
            message: 'Token não informado.'
        });
        return false
    }

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) {
            res.status(500).json({
                auth: false,
                message: err.message == "jwt expired" ? "expirado" : "token inválido"
            });
            return false;
        }

        // se tudo estiver ok, salva no request para uso posterior
        req.email = decoded.email;
        return true;
    });
}

module.exports = authorize