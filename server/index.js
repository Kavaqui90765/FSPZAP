const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log('Usando Firebase Firestore...');
    require('./db/firebase');

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.static(path.join(__dirname, '..', 'public')));

    app.use('/api/fspzap', require('./routes/megazap'));
    app.use('/api/fspzap/import', require('./routes/import'));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`Servidor FSPZAP rodando em http://localhost:${PORT}`);
      console.log('Banco de dados: Firebase Firestore');
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

start();
