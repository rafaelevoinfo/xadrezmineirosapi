const firebase = require("firebase/app");
const firebase_admin = require("firebase-admin");
require("firebase/firestore");
require("firebase/auth");

firebase.initializeApp({
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
});

firebase_admin.initializeApp({
  credential:firebase_admin.credential.applicationDefault()
  // credential: firebase_admin.credential.cert({
  //   type: process.env.TYPE,
  //   project_id: process.env.PROJECT_ID,
  //   private_key_id: process.env.PRIVATE_KEY_ID,
  //   private_key: process.env.PRIVATE_KEY,
  //   client_email: process.env.CLIENT_EMAIL,
  //   client_id: process.env.CLIENT_ID,
  //   auth_uri: process.env.AUTH_URI,
  //   token_uri: process.env.TOKEN_URI,
  //   auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  //   client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  // }),
});

module.exports = {firebase, firebase_admin}
