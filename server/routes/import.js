const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');

const queries = require('../db/firebase-queries');

const REQUIRED_COLUMNS = ['ORIGEM', 'PROTOCOLO', 'STATUS', 'NUMERO', 'DATA'];

function normalizeHeader(header) {
  return header
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase();
}

function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');

  if (typeof value === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 19).replace('T', ' ');
    }
  }

  return null;
}

function calculateTempoAtendimento(data, dataUltimaMensagem) {
  if (!data || !dataUltimaMensagem) return null;
  const diff = new Date(dataUltimaMensagem) - new Date(data);
  return Math.round(diff / 60000);
}

router.post('/', async (req, res) => {
  try {
    if (!req.body || !req.body.fileData) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const { fileData, fileName, batchSize = 100 } = req.body;

    const buffer = Buffer.from(fileData, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (rawData.length === 0) {
      return res.status(400).json({ error: 'Arquivo vazio ou sem dados válidos' });
    }

    const headers = Object.keys(rawData[0]);
    const normalizedHeaders = headers.map(normalizeHeader);
    const missingColumns = REQUIRED_COLUMNS.filter(col => !normalizedHeaders.includes(col));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        error: `Colunas obrigatórias faltando: ${missingColumns.join(', ')}`
      });
    }

    let imported = 0;
    let errors = 0;

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);

      for (const row of batch) {
        try {
          const normalizedRow = {};
          headers.forEach((header, index) => {
            normalizedRow[normalizedHeaders[index]] = row[header];
          });

          const data = {
            origem: normalizedRow.ORIGEM || '',
            protocolo: String(normalizedRow.PROTOCOLO || ''),
            status: normalizedRow.STATUS || '',
            atendente: normalizedRow.ATENDENTE || '',
            departamento: normalizedRow.DEPARTAMENTO || '',
            motivo: normalizedRow.MOTIVO || null,
            nome: normalizedRow.NOME || '',
            numero: String(normalizedRow.NUMERO || ''),
            data: parseDate(normalizedRow.DATA),
            dataFinalizacao: parseDate(normalizedRow.DATA_FINALIZACAO || normalizedRow.DATAFINALIZACAO),
            dataUltimaMensagem: parseDate(normalizedRow.DATA_ULTIMA_MENSAGEM || normalizedRow.DATAULTIMAMENSAGEM),
            possuiAnexo: normalizedRow.POSUI_ANEXO || normalizedRow.POSUIANEXO ? 1 : 0,
            avaliacao: normalizedRow.AVALIACAO || null,
            tempoAtendimento: null
          };

          data.tempoAtendimento = calculateTempoAtendimento(data.data, data.dataUltimaMensagem);

          await queries.upsertAttendance(data);
          imported++;
        } catch (err) {
          errors++;
          console.error(`Erro na linha ${i}:`, err.message);
        }
      }
    }

    res.json({
      success: true,
      fileName,
      totalRows: rawData.length,
      imported,
      errors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
