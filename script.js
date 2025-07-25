const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('videoInput');
const processBtn = document.getElementById('processBtn');
const progress = document.getElementById('progress');

let selectedFile = null;

// Click to select
dropArea.addEventListener('click', () => fileInput.click());

// Drag over
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.classList.add('dragover');
});

// Drag leave
dropArea.addEventListener('dragleave', () => {
  dropArea.classList.remove('dragover');
});

// Drop file
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.classList.remove('dragover');
  selectedFile = e.dataTransfer.files[0];
  if (selectedFile) {
    progress.innerText = `Selected: ${selectedFile.name}`;
    processBtn.disabled = false;
  }
});

// File input
fileInput.addEventListener('change', (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    progress.innerText = `Selected: ${selectedFile.name}`;
    processBtn.disabled = false;
  }
});
