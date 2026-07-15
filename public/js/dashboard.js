let chartAgente = null;
let chartDepartamento = null;
let chartHora = null;
let chartSatisfacao = null;

async function loadDashboard() {
  const filters = getFilters();

  try {
    const [kpis, porAgente, porDepartamento, porHora, satisfacao] = await Promise.all([
      api.getKPIs(filters),
      api.getPorAgente(filters),
      api.getPorDepartamento(filters),
      api.getPorHora(filters),
      api.getSatisfacao(filters)
    ]);

    updateKPIs(kpis);
    updateChartAgente(porAgente);
    updateChartDepartamento(porDepartamento);
    updateChartHora(porHora);
    updateChartSatisfacao(satisfacao);
  } catch (error) {
    showToast('Erro ao carregar dados: ' + error.message, 'error');
  }
}

function updateKPIs(kpis) {
  document.getElementById('kpiTotal').textContent = kpis.total || 0;
  document.getElementById('kpiSatisfacao').textContent = kpis.satisfacao || 0;
  document.getElementById('kpiTMA').textContent = (kpis.tma || 0) + ' min';
  document.getElementById('kpiCobertura').textContent = (kpis.cobertura || 0) + '%';
}

function updateChartAgente(data) {
  const ctx = document.getElementById('chartAgente').getContext('2d');

  if (chartAgente) chartAgente.destroy();

  chartAgente = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => truncateText(d.atendente, 15)),
      datasets: [{
        label: 'Atendimentos',
        data: data.map(d => d.total),
        backgroundColor: getChartColors(data.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChartDepartamento(data) {
  const ctx = document.getElementById('chartDepartamento').getContext('2d');

  if (chartDepartamento) chartDepartamento.destroy();

  chartDepartamento = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(d => truncateText(d.departamento, 15)),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: getChartColors(data.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12 }
        }
      }
    }
  });
}

function updateChartHora(data) {
  const ctx = document.getElementById('chartHora').getContext('2d');

  if (chartHora) chartHora.destroy();

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const hourData = hours.map(h => {
    const found = d => d.hora === h;
    const item = data.find(found);
    return item ? item.total : 0;
  });

  chartHora = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours.map(h => `${h}h`),
      datasets: [{
        label: 'Atendimentos',
        data: hourData,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChartSatisfacao(data) {
  const ctx = document.getElementById('chartSatisfacao').getContext('2d');

  if (chartSatisfacao) chartSatisfacao.destroy();

  const labels = { '1': '1 - Péssimo', '2': '2 - Ruim', '3': '3 - Regular', '4': '4 - Bom', '5': '5 - Excelente', '': 'Sem avaliação' };
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#2563eb', '#94a3b8'];

  chartSatisfacao = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => labels[d.avaliacao] || d.avaliacao),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: colors.slice(0, data.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12 }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', loadDashboard);
