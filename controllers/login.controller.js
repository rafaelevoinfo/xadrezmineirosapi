const jwt = require('jsonwebtoken')

class LoginController {

    constructor(ipAuth) {
        this.auth = ipAuth;
    }


    async login(ipBody) {
        let vaResult = {
            auth: false,
            token: ''
        }
        try {
            if (process.env.DEBUG) {
              console.log(ipBody);
            }
            let {
                email,
                senha
            } = ipBody;

            if ((email) && (senha)) {                
                let vaUserCredential = await this.auth.signInWithEmailAndPassword(email, senha);
                
                vaResult.auth = true;
                vaUserCredential.user.email;
                vaResult.token = jwt.sign({
                    "email": vaUserCredential.user.email
                }, process.env.SECRET, {
                    expiresIn: 86400 // expires in 1 day
                });                
            }
        } catch (error) {
            console.log(error)
        }

        return vaResult
    }
}

module.exports = LoginController