let allData = [];
let currentPage = 1;
const rowsPerPage = 20;

async function loadRelatorio() {
  const filters = getFilters();

  try {
    allData = await api.getRelatorio(filters, 1000);
    currentPage = 1;
    renderTable();
    renderPagination();
  } catch (error) {
    showToast('Erro ao carregar relatório: ' + error.message, 'error');
  }
}

function renderTable() {
  const tbody = document.getElementById('relatorioTable');
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = allData.slice(start, end);

  tbody.innerHTML = pageData.map(row => `
    <tr>
      <td>${row.protocolo || '-'}</td>
      <td>${row.origem || '-'}</td>
      <td>${row.status || '-'}</td>
      <td>${truncateText(row.atendente, 20)}</td>
      <td>${truncateText(row.departamento, 20)}</td>
      <td>${truncateText(row.nome, 20)}</td>
      <td>${row.numero || '-'}</td>
      <td>${formatDateTime(row.data)}</td>
      <td>${row.avaliacao || '-'}</td>
      <td>${row.tempoAtendimento || '-'}</td>
    </tr>
  `).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(allData.length / rowsPerPage);
  const pagination = document.getElementById('pagination');

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '';

  if (currentPage > 1) {
    html += `<button class="btn-secondary" onclick="goToPage(${currentPage - 1})">Anterior</button>`;
  }

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button class="${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += `<span style="padding: 0.5rem;">...</span>`;
    }
  }

  if (currentPage < totalPages) {
    html += `<button class="btn-secondary" onclick="goToPage(${currentPage + 1})">Próximo</button>`;
  }

  pagination.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderTable();
  renderPagination();
}

function exportCSV() {
  if (allData.length === 0) {
    showToast('Nenhum dado para exportar', 'error');
    return;
  }

  const headers = ['Protocolo', 'Origem', 'Status', 'Atendente', 'Departamento', 'Motivo', 'Nome', 'Numero', 'Data', 'Data Finalização', 'Avaliação', 'Tempo (min)'];
  const rows = allData.map(row => [
    row.protocolo,
    row.origem,
    row.status,
    row.atendente,
    row.departamento,
    row.motivo,
    row.nome,
    row.numero,
    row.data,
    row.dataFinalizacao,
    row.avaliacao,
    row.tempoAtendimento
  ].map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `fspzap_relatorio_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  showToast('Relatório exportado com sucesso!');
}

document.addEventListener('DOMContentLoaded', loadRelatorio);
