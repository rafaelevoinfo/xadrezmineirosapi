require('dotenv').config();

const express = require('express');
const serviceAccount2 = require("./serviceAccountKey.json");
const admin = require('firebase-admin');
const rotasTorneio = require('./routers/torneio.router')
const cors = require('cors')

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
} 


console.log(serviceAccount);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

rotasTorneio.addRotasTorneio(app, db);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log('Iniciado');
});