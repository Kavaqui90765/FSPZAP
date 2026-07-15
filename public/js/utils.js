function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('pt-BR');
}

function getFilters() {
  return {
    startDate: document.getElementById('startDate')?.value || '',
    endDate: document.getElementById('endDate')?.value || '',
    atendente: document.getElementById('atendente')?.value || '',
    departamento: document.getElementById('departamento')?.value || ''
  };
}

function getChartColors(count) {
  const colors = [
    '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'
  ];
  return colors.slice(0, count);
}

function truncateText(text, maxLength = 20) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
