// SIDEBAR TOGGLE
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('overlay');

hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});

// TAB SWITCHING
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    switchTab(item.dataset.tab);
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
});

function switchTab(name) {
  document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tab="${name}"]`).classList.add('active');
  document.getElementById(`tab-${name}`).classList.add('active');
}

// UPLOAD
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadLabel = document.getElementById('uploadLabel');
const uploadCard = document.getElementById('uploadCard');
const previewCard = document.getElementById('previewCard');
const previewImg = document.getElementById('previewImg');
const previewFilename = document.getElementById('previewFilename');
const analyzeBtn = document.getElementById('analyzeBtn');
const resetBtn = document.getElementById('resetBtn');
const resetBtn2 = document.getElementById('resetBtn2');
const resultCard = document.getElementById('resultCard');
const loader = document.getElementById('loader');
const resultContent = document.getElementById('resultContent');
const resultImg = document.getElementById('resultImg');
const verdictBadge = document.getElementById('verdictBadge');
const confidenceBar = document.getElementById('confidenceBar');
const confidenceValue = document.getElementById('confidenceValue');
const inferenceTime = document.getElementById('inferenceTime');
const noteEl = document.getElementById('resultNote');

let selectedFile = null;

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

dropZone.addEventListener('click', (e) => {
  if (e.target === uploadLabel || uploadLabel.contains(e.target)) return;
  fileInput.click();
});

uploadLabel.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) return alert('Harap upload file gambar.');
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewFilename.textContent = file.name;
    uploadCard.classList.add('hidden');
    previewCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
  };
  reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  previewCard.classList.add('hidden');
  resultCard.classList.remove('hidden');
  loader.classList.remove('hidden');
  resultContent.classList.add('hidden');

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const res = await fetch('/predict', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    showResult(data);
  } catch (err) {
    loader.classList.add('hidden');
    alert('Error: ' + err.message);
    reset();
  }
});

function showResult(data) {
  loader.classList.add('hidden');
  resultContent.classList.remove('hidden');
  resultImg.src = data.image_url;

  const isReal = data.label === 'REAL';
  verdictBadge.textContent = isReal ? '✔ ASLI (Real)' : '✘ PALSU (Fake)';
  verdictBadge.className = 'verdict-badge ' + (isReal ? 'real' : 'fake');

  confidenceBar.className = 'bar-fill ' + (isReal ? 'real' : 'fake');
  confidenceBar.style.width = '0%';
  setTimeout(() => { confidenceBar.style.width = data.confidence + '%'; }, 50);

  confidenceValue.textContent = data.confidence + '%';
  confidenceValue.style.color = isReal ? 'var(--real)' : 'var(--fake)';
  inferenceTime.textContent = data.inference_time + ' ms';

  noteEl.textContent = isReal
    ? 'Gambar ini menunjukkan karakteristik wajah manusia asli. Namun, deepfake yang canggih masih mungkin lolos dari deteksi.'
    : 'Gambar ini menunjukkan tanda-tanda hasil generasi AI. Jika ini penting, pertimbangkan untuk memverifikasi dengan alat lain.';
}

function reset() {
  selectedFile = null;
  fileInput.value = '';
  uploadCard.classList.remove('hidden');
  previewCard.classList.add('hidden');
  resultCard.classList.add('hidden');
  loader.classList.add('hidden');
  resultContent.classList.add('hidden');
  confidenceBar.style.width = '0%';
}

resetBtn.addEventListener('click', reset);
resetBtn2.addEventListener('click', reset);