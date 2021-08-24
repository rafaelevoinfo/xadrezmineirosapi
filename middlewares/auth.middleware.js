const jwt = require('jsonwebtoken')

function authorize(req, res, next) {
    if ((req.url === '/login') && (req.method === 'POST')) {
        next()
    } else {
        const token = req.headers['x-access-token'];
        if (!token) return res.status(401).json({
            auth: false,
            message: 'Token não informado.'
        });

        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) return res.status(500).json({
                auth: false,
                message: err.message == "jwt expired"?"expirado":"token inválido"
            });

            // se tudo estiver ok, salva no request para uso posterior
            req.email = decoded.email;
            next();
        });
    }
}


module.exports = authorize