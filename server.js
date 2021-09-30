require('dotenv').config();

const express = require('express');
require('express-async-errors');
const {firebase, firebase_admin} = require('./firebase')
const cors = require('cors')
const {handle_error} = require('./middlewares/handle_error.middleware')

const app = express();

app.use(cors());
app.use(express.json());


const rotasTorneio = require('./routers/torneio.router')
const rotasLogin = require('./routers/login.router')
const rotasJogador = require('./routers/jogador.router')

//app.use(require('./middlewares/auth.middleware'))


const db = firebase_admin.firestore();
const auth = firebase.auth();

rotasTorneio.addRotasTorneio(app, db);
rotasLogin.addRotasLogin(app, auth);
rotasJogador.addRotasJogador(app);

app.use(handle_error);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log(`Iniciado na porta ${process.env.PORT||8080}`);
});