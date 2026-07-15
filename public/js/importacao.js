let selectedFile = null;

async function loadResumo() {
  try {
    const resumo = await api.getResumoImportacao();
    document.getElementById('resumoTotal').textContent = resumo.total || 0;
    document.getElementById('resumoPeriodo').textContent =
      resumo.primeiraData ? `${formatDate(resumo.primeiraData)} - ${formatDate(resumo.ultimaData)}` : '-';
    document.getElementById('resumoAtualizacao').textContent =
      resumo.ultimaAtualizacao ? formatDateTime(resumo.ultimaAtualizacao) : '-';
  } catch (error) {
    console.error('Erro ao carregar resumo:', error);
  }
}

function setupDropZone() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });
}

function handleFile(file) {
  if (!file.name.match(/\.xlsx?$/i)) {
    showToast('Por favor, selecione um arquivo Excel (.xlsx)', 'error');
    return;
  }

  selectedFile = file;
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatFileSize(file.size);
  document.getElementById('fileInfo').style.display = 'block';
  document.getElementById('progressArea').style.display = 'none';
  document.getElementById('resultArea').style.display = 'none';
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function uploadFile() {
  if (!selectedFile) {
    showToast('Nenhum arquivo selecionado', 'error');
    return;
  }

  const progressArea = document.getElementById('progressArea');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const resultArea = document.getElementById('resultArea');

  progressArea.style.display = 'block';
  resultArea.style.display = 'none';
  progressFill.style.width = '30%';
  progressText.textContent = 'Lendo arquivo...';

  try {
    const base64 = await fileToBase64(selectedFile);

    progressFill.style.width = '60%';
    progressText.textContent = 'Importando dados...';

    const result = await api.importFile(base64, selectedFile.name);

    progressFill.style.width = '100%';
    progressText.textContent = 'Concluído!';

    document.getElementById('resultTotal').textContent = result.totalRows;
    document.getElementById('resultImported').textContent = result.imported;
    document.getElementById('resultErrors').textContent = result.errors;
    resultArea.style.display = 'block';

    showToast(`Importação concluída: ${result.imported} registros importados`);
    loadResumo();
  } catch (error) {
    showToast('Erro na importação: ' + error.message, 'error');
    progressArea.style.display = 'none';
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupDropZone();
  loadResumo();
});
