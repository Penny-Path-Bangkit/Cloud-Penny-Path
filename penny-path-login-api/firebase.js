const admin = require('firebase-admin');
const dotenv = require('dotenv');
const firebase = require('firebase/app');
require('firebase/auth');
dotenv.config();

// Initialize the Firebase Admin SDK
const serviceAccount = require('./firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase Client SDK configuration
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER,
    appId: process.env.APP_ID,
  };
  
  firebase.initializeApp(firebaseConfig);

module.exports = { admin, firebase };