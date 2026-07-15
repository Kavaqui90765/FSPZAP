const { initializeApp, cert, getFirestore } = require('firebase-admin/app');
const { getFirestore: getFirestoreService } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let db = null;

function getDb() {
  if (!db) {
    let serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountPath) {
      const files = fs.readdirSync(path.resolve('.')).filter(f =>
        f.endsWith('.json') && f !== 'package.json' && f !== 'package-lock.json' && f !== 'firestore.indexes.json'
      );
      if (files.length > 0) {
        serviceAccountPath = './' + files[0];
      }
    }

    if (!serviceAccountPath) {
      throw new Error('Arquivo de chave de serviço Firebase não encontrado');
    }

    const serviceAccount = require(path.resolve(serviceAccountPath));

    const { initializeApp } = require('firebase-admin/app');
    const { getFirestore } = require('firebase-admin/firestore');

    initializeApp({
      credential: cert(serviceAccount)
    });

    db = getFirestore();
    console.log('Conectado ao Firebase Firestore');
  }
  return db;
}

module.exports = { getDb };
