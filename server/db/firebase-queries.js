const { getDb } = require('./firebase');

const COLLECTION = 'fspzap_attendances';

function buildWhereClause(query, filters = {}) {
  if (filters.startDate) {
    query = query.where('data', '>=', new Date(filters.startDate));
  }
  if (filters.endDate) {
    query = query.where('data', '<=', new Date(filters.endDate));
  }
  if (filters.atendente) {
    query = query.where('atendente', '==', filters.atendente);
  }
  if (filters.departamento) {
    query = query.where('departamento', '==', filters.departamento);
  }
  return query;
}

async function getKPIs(filters = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);

  const snapshot = await query.get();
  const docs = snapshot.docs.map(doc => doc.data());

  if (docs.length === 0) {
    return { total: 0, tma: 0, cobertura: 0, satisfacao: 0 };
  }

  const total = docs.length;
  const temposAtendimento = docs.filter(d => d.tempoAtendimento != null).map(d => d.tempoAtendimento);
  const tma = temposAtendimento.length > 0
    ? Math.round(temposAtendimento.reduce((a, b) => a + b, 0) / temposAtendimento.length * 10) / 10
    : 0;

  const avaliacoes = docs.filter(d => d.avaliacao && ['1','2','3','4','5'].includes(d.avaliacao));
  const cobertura = total > 0 ? Math.round(avaliacoes.length * 1000 / total) / 10 : 0;

  const satisfacao = avaliacoes.length > 0
    ? Math.round(avaliacoes.reduce((a, d) => a + parseInt(d.avaliacao), 0) / avaliacoes.length * 10) / 10
    : 0;

  return { total, tma, cobertura, satisfacao };
}

async function getPorAgente(filters = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);

  const snapshot = await query.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const grouped = {};
  docs.forEach(d => {
    const agente = d.atendente || 'Sem atendente';
    grouped[agente] = (grouped[agente] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([atendente, total]) => ({ atendente, total }))
    .sort((a, b) => b.total - a.total);
}

async function getPorDepartamento(filters = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);

  const snapshot = await query.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const grouped = {};
  docs.forEach(d => {
    const dept = d.departamento || 'Sem departamento';
    grouped[dept] = (grouped[dept] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([departamento, total]) => ({ departamento, total }))
    .sort((a, b) => b.total - a.total);
}

async function getPorHora(filters = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);

  const snapshot = await query.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const grouped = {};
  docs.forEach(d => {
    if (d.data) {
      const date = d.data.toDate ? d.data.toDate() : new Date(d.data);
      const hora = date.getHours();
      grouped[hora] = (grouped[hora] || 0) + 1;
    }
  });

  return Object.entries(grouped)
    .map(([hora, total]) => ({ hora: parseInt(hora), total }))
    .sort((a, b) => a.hora - b.hora);
}

async function getSatisfacao(filters = {}) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);

  const snapshot = await query.get();
  const docs = snapshot.docs.map(doc => doc.data());

  const grouped = {};
  docs.forEach(d => {
    const avaliacao = d.avaliacao || 'Sem avaliação';
    grouped[avaliacao] = (grouped[avaliacao] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([avaliacao, total]) => ({ avaliacao, total }))
    .sort((a, b) => {
      if (a.avaliacao === 'Sem avaliação') return 1;
      if (b.avaliacao === 'Sem avaliação') return -1;
      return a.avaliacao.localeCompare(b.avaliacao);
    });
}

async function getRelatorio(filters = {}, limit = 100) {
  const db = getDb();
  let query = db.collection(COLLECTION);
  query = buildWhereClause(query, filters);
  query = query.orderBy('data', 'desc').limit(limit);

  const snapshot = await query.get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    data: doc.data().data?.toDate ? doc.data().data.toDate().toISOString() : doc.data().data,
    dataFinalizacao: doc.data().dataFinalizacao?.toDate ? doc.data().dataFinalizacao.toDate().toISOString() : doc.data().dataFinalizacao,
    dataUltimaMensagem: doc.data().dataUltimaMensagem?.toDate ? doc.data().dataUltimaMensagem.toDate().toISOString() : doc.data().dataUltimaMensagem
  }));
}

async function getResumoImportacao() {
  const db = getDb();
  const snapshot = await db.collection(COLLECTION).get();

  if (snapshot.empty) {
    return { total: 0, primeiraData: null, ultimaData: null, ultimaAtualizacao: null };
  }

  const docs = snapshot.docs.map(doc => doc.data());
  const datas = docs.filter(d => d.data).map(d => {
    const date = d.data?.toDate ? d.data.toDate() : new Date(d.data);
    return date;
  });

  return {
    total: docs.length,
    primeiraData: datas.length > 0 ? new Date(Math.min(...datas)).toISOString() : null,
    ultimaData: datas.length > 0 ? new Date(Math.max(...datas)).toISOString() : null,
    ultimaAtualizacao: new Date().toISOString()
  };
}

async function upsertAttendance(data) {
  const db = getDb();
  const docRef = db.collection(COLLECTION).doc(data.protocolo);

  const firestoreData = {
    origem: data.origem || '',
    protocolo: data.protocolo || '',
    status: data.status || '',
    atendente: data.atendente || '',
    departamento: data.departamento || '',
    motivo: data.motivo || null,
    nome: data.nome || '',
    numero: data.numero || '',
    data: data.data ? new Date(data.data) : null,
    dataFinalizacao: data.dataFinalizacao ? new Date(data.dataFinalizacao) : null,
    dataUltimaMensagem: data.dataUltimaMensagem ? new Date(data.dataUltimaMensagem) : null,
    possuiAnexo: data.possuiAnexo || 0,
    avaliacao: data.avaliacao || null,
    tempoAtendimento: data.tempoAtendimento || null,
    updatedAt: new Date()
  };

  await docRef.set(firestoreData, { merge: true });
  return { protocolo: data.protocolo };
}

module.exports = {
  getKPIs,
  getPorAgente,
  getPorDepartamento,
  getPorHora,
  getSatisfacao,
  getRelatorio,
  getResumoImportacao,
  upsertAttendance
};
