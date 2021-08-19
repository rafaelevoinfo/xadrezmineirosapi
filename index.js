require('dotenv').config();

const express = require('express');
const path = require('path');
//const environment = require('./enviroments');
const serviceAccount = require("./serviceAccountKey.json");
const admin = require('firebase-admin');
const TorneioService = require('./torneios.service')

const app = express();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.get('/torneios', async (req, res) => {    
    let vaTorneioService = new TorneioService(admin.firestore())
    let vaTorneios = await vaTorneioService.buscarTorneios(false);    
    res.send(vaTorneios)
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080, () => {
    console.log('Iniciado');
});