require('dotenv').config();

const express = require('express');
const firebase = require('./firebase')

const rotasTorneio = require('./routers/torneio.router')
const rotasLogin = require('./routers/login.router')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express();
app.use(cors());
app.use(express.json());
//app.use(require('./middlewares/auth.middleware'))

const db = firebase.firestore();
const auth = firebase.auth();
//TODO: Implementar login daquela forma que não precisa de usuario e senha
rotasTorneio.addRotasTorneio(app, db);
rotasLogin.addRotasLogin(app, auth);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log(`Iniciado na porta ${process.env.PORT||8080}`);
});