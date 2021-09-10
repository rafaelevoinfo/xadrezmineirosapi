require('dotenv').config();

const express = require('express');
const firebase = require('./firebase')
const firebase_admin = require("firebase-admin");
const cors = require('cors')

const app = express();

app.use(cors());
app.use(express.json());

const rotasTorneio = require('./routers/torneio.router')
const rotasLogin = require('./routers/login.router')

//app.use(require('./middlewares/auth.middleware'))

firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  })
});

const db = firebase_admin.firestore();
const auth = firebase.auth();

rotasTorneio.addRotasTorneio(app, db);
rotasLogin.addRotasLogin(app, auth);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log(`Iniciado na porta ${process.env.PORT||8080}`);
});