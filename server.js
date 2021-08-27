require('dotenv').config();

const express = require('express');
const firebase = require('firebase/app');
require("firebase/auth");
require("firebase/firestore");
const rotasTorneio = require('./routers/torneio.router')
const rotasLogin = require('./routers/login.router')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const app = express();
app.use(cors());
app.use(express.json());
//app.use(require('./middlewares/auth.middleware'))

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
}

firebase.initializeApp(
    firebaseConfig
);

const db = firebase.firestore();
const auth = firebase.auth();

rotasTorneio.addRotasTorneio(app, db);
rotasLogin.addRotasLogin(app, auth);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log(`Iniciado na porta ${process.env.PORT||8080}`);
});