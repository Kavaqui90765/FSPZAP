const { getDb } = require('./server/db/firebase');

try {
  const db = getDb();
  console.log('Firebase Firestore conectado com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}
