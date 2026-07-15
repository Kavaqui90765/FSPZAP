const express = require('express');
const router = express.Router();

const queries = require('../db/firebase-queries');

router.get('/kpis', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const kpis = await queries.getKPIs(filters);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/por-agente', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const data = await queries.getPorAgente(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/por-departamento', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const data = await queries.getPorDepartamento(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/por-hora', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const data = await queries.getPorHora(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/satisfacao', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const data = await queries.getSatisfacao(filters);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/relatorio', async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      atendente: req.query.atendente,
      departamento: req.query.departamento
    };
    const limit = parseInt(req.query.limit) || 100;
    const data = await queries.getRelatorio(filters, limit);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/resumo-importacao', async (req, res) => {
  try {
    const resumo = await queries.getResumoImportacao();
    res.json(resumo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
